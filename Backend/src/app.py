import concurrent.futures
import os
import smtplib
import logging
import gdown
import time
from datetime import datetime, timedelta, timezone
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from threading import Thread
from ai import LLM
from decorators import require_api_key
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
from settings import SERVER_SETTINGS
from database import Database, User
from schedule import every, repeat, run_pending

###################################################################################################################
#                                             GLOBAL VARIABLES                                                    #
###################################################################################################################

app = Flask(__name__, template_folder=SERVER_SETTINGS['template_directory'])
llm = LLM()
db = Database(app, llm)


###################################################################################################################
#                                                 METHODS                                                         #
###################################################################################################################


def init_server() -> None:
    try:
        CORS(app)  # Initialize CORS with default options, allowing requests from any origin. To be modified in a production environment.
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', filename=SERVER_SETTINGS['server_log_file'])

        if not os.path.exists(SERVER_SETTINGS["users_csv_file"]):
            download_users_csv_file_from_google_drive()

        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            llm_future = executor.submit(llm.init)
            llm_future.result()

            if not llm.is_available:
                raise Exception("Server initialization failed.")

            db_future = executor.submit(db.init)
            db_future.result()

            if not llm.is_available:
                raise Exception("Server initialization failed.")

    except Exception as e:
        logging.error(msg=str(e), exc_info=True)
    else:
        logging.info(msg="The server has been successfully initialized.")


def download_users_csv_file_from_google_drive() -> None:
    if not os.path.exists(SERVER_SETTINGS["resources_directory"]):
        os.makedirs(SERVER_SETTINGS["resources_directory"])

    gdown.download(id=SERVER_SETTINGS["google_drive_csv_file_id"], output=SERVER_SETTINGS["users_csv_file"], quiet=True)


@repeat(every().sunday.at("01:00", "Canada/Eastern"))
def check_for_database_updates() -> None:
    try:
        if not db.is_available:
            logging.warning("Unable to run database updates. Database is not available.")
            return

        if not llm.is_available:
            logging.warning("Unable to run database updates. LLM is not available.")
            return

        download_users_csv_file_from_google_drive()
        db.update(SERVER_SETTINGS["users_csv_file"])

    except Exception as e:
        logging.error(msg=str(e), exc_info=True)


def check_scheduled_tasks():
    while True:
        run_pending()
        # time.sleep(3600)  # Check every hour
        time.sleep(10)


def start_scheduled_tasks_thread():
    t = Thread(target=check_scheduled_tasks)
    t.daemon = True  # Make the thread a daemon, so it doesn't block program termination
    t.start()


###################################################################################################################
#                                                 ROUTES                                                          #
###################################################################################################################

@app.route('/', methods=['GET'], endpoint='index')
def index():
    formatted_datetime = datetime.now(timezone(-timedelta(hours=4), 'EDT')).strftime("%Y-%m-%d %H:%M:%S")
    return render_template('index.html', formatted_datetime=formatted_datetime)


@app.route('/users', methods=['GET'], endpoint='get_users')
@require_api_key
def get_users():
    if not db.is_available:
        return jsonify({"message": "Database not available"}), 503

    users = User.query.all()

    if users:
        return users, 200
    else:
        return jsonify({"message": "Empty database"}), 404


@app.route('/users/<int:user_id>', methods=['GET'], endpoint='get_user')
@require_api_key
def get_user(user_id):
    if not db.is_available:
        return jsonify({"message": "Database not available"}), 503

    user = db.session.get(User, user_id)

    if user:
        return jsonify(user), 200
    else:
        return jsonify({"message": "User not found"}), 404


@app.route('/search', methods=['POST'], endpoint='search_users')
@require_api_key
def search_users():
    try:
        if not llm.is_available:
            return jsonify({"message": "LLM not available"}), 503

        if not db.is_available:
            return jsonify({"message": "Database not available"}), 503

        question = request.get_data(as_text=True)

        if question:
            experts = llm.get_experts_recommandation(question)

            if experts:
                return experts, 200
            else:
                return jsonify({"message": "No users were found matching your query"}), 404
        else:
            return jsonify({"message": "No question provided"}), 400

    except Exception as e:
        logging.error(msg=str(e), exc_info=True)
        return jsonify({"message": "An error occurred while searching for the answer to the question."}), 500


@app.route('/request_profile_correction', methods=['POST'], endpoint='request_profile_correction')
@require_api_key
def request_profile_correction():
    try:
        member_id = request.form.get('id')
        member_last_name = request.form.get('memberLastName')
        member_first_name = request.form.get('memberFirstName')
        requester_email = request.form.get('requesterEmail')
        requester_first_name = request.form.get('requesterFirstName')
        requester_last_name = request.form.get('requesterLastName')
        message = request.form.get('message')
        uploaded_file = request.files.get('profilePicture')

        subject = 'Répertoire des expertises de la CPIAS - Demande de modification du profil de {}'.format(f"{member_first_name} {member_last_name}")
        message = '''
            Bonjour,
            {} ({}) a réclamé une modification des informations de {} (ID={}) sur le répertoire des expertises de la CPIAS.
                
            Contenu du message :
            "{}"
        '''.format(f"{requester_first_name} {requester_last_name}", requester_email, f"{member_first_name} {member_last_name}", member_id, message)

        sender = os.environ.get('EMAIL_SENDER')
        recipients = os.environ.get('EMAIL_RECIPIENT')
        password = os.environ.get('EMAIL_SENDER_PASSWORD')

        msg = MIMEMultipart()
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = recipients

        body = MIMEText(message, 'plain')
        msg.attach(body)

        if uploaded_file:
            # Create attachment and adds it to the message.
            attachment_data = uploaded_file.read()
            part = MIMEApplication(attachment_data)
            part.add_header('content-disposition', 'attachment', filename=secure_filename(uploaded_file.filename))
            msg.attach(part)

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
            smtp_server.login(sender, password)
            smtp_server.sendmail(sender, recipients, msg.as_string())

        return jsonify({"message": "Email sent successfully."}), 200

    except Exception as e:
        logging.error(msg=str(e), exc_info=True)
        return jsonify({"message": "An error occurred and email could not be sent."}), 500


@app.route('/filter', methods=['POST'], endpoint='filter_users')
@require_api_key
def filter_users():
    try:
        if not db.is_available:
            return jsonify({"message": "Database not available"}), 503

        criteria = request.json
        query = User.query

        for attr in dir(User):
            if attr in criteria:
                if attr in ['years_experience_ia', 'years_experience_healthcare']:
                    query = query.filter(getattr(User, attr) >= criteria[attr])
                elif attr in ['affiliation_organization', 'community_involvement', 'suggestions', 'skills']:
                    query = query.filter(getattr(User, attr).like(f"%{criteria[attr]}%"))
                else:
                    query = query.filter(getattr(User, attr) == criteria[attr])

        matching_users = query.all()
        return matching_users, 200

    except Exception as e:
        logging.error(msg=str(e), exc_info=True)
        return jsonify({'message': 'An error occurred when filtering users.'}), 500


@app.route('/keywords', methods=['POST'], endpoint='get_keywords_from_user_expertise')
@require_api_key
def get_keywords_from_user_expertise():
    try:
        if not llm.is_available:
            return jsonify({"message": "LLM not available"}), 503

        user_expertise = request.get_data(as_text=True)

        if user_expertise:
            keywords = llm.get_keywords(user_expertise)
            return keywords, 200
        else:
            return jsonify({"message": "No user expertise provided"}), 400

    except Exception as e:
        logging.error(msg=str(e), exc_info=True)
        return jsonify({"message": "An error occurred while extracting keywords from user expertise."}), 500


if __name__ == '__main__':
    init_server()
    start_scheduled_tasks_thread()
    app.run(
        debug=True,
        host='0.0.0.0',
        port=80
    )
