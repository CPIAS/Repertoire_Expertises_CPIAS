import concurrent.futures
import os
import smtplib
import logging
import gdown
import time
from pathlib import Path
from datetime import datetime, timedelta, timezone
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from threading import Thread
from ai import LLM
from decorators import require_api_key
from flask import Flask, jsonify, render_template, request, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from settings import SERVER_SETTINGS
from database import Database, User
from schedule import every, repeat, run_pending

###################################################################################################################
#                                             GLOBAL VARIABLES                                                    #
###################################################################################################################

app_logger = logging.getLogger('gunicorn.error')
app = Flask(__name__, template_folder=SERVER_SETTINGS['template_directory'])
llm = LLM(app_logger)
db = Database(app, llm, app_logger)


###################################################################################################################
#                                                 METHODS                                                         #
###################################################################################################################

def init_server() -> None:
    try:
        CORS(app)  # Initialize CORS with default options, allowing requests from any origin. To be modified in a production environment.
        app_logger.setLevel(logging.INFO)

        if not os.path.exists(SERVER_SETTINGS["users_csv_file"]):
            raise Exception(f"Server initialization failed. {SERVER_SETTINGS['users_csv_file']} does not exist.")

        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            llm_future = executor.submit(llm.init)
            llm_future.result()

            if not llm.is_available:
                raise Exception("Server initialization failed. LLM is not available.")

            db_future = executor.submit(db.init)
            db_future.result()

            if not db.is_available:
                raise Exception("Server initialization failed. Database is not available.")

    except Exception as e:
        app_logger.error(msg=str(e), exc_info=True)
    else:
        app_logger.info(msg="The server has been successfully initialized.")


def download_users_csv_file_from_google_drive() -> None:  # Only works if the file is public on Google Drive
    if not os.path.exists(SERVER_SETTINGS["resources_directory"]):
        os.makedirs(SERVER_SETTINGS["resources_directory"])

    gdown.download(id=SERVER_SETTINGS["google_drive_csv_file_id"], output=SERVER_SETTINGS["users_csv_file"], quiet=True)


@repeat(every().sunday.at("01:00", "Canada/Eastern"))
def check_for_database_updates() -> None:
    try:
        if not db.is_available:
            app_logger.warning("Unable to run database updates. Database is not available.")
            return

        if not llm.is_available:
            app_logger.warning("Unable to run database updates. LLM is not available.")
            return

        download_users_csv_file_from_google_drive()
        db.update(SERVER_SETTINGS["users_csv_file"])

    except Exception as e:
        app_logger.error(msg=str(e), exc_info=True)


def check_scheduled_tasks():
    while True:
        run_pending()
        time.sleep(3600)  # Check every hour


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


@app.route('/search', methods=['POST'], endpoint='search_experts')
@require_api_key
def search_experts():
    try:
        if not llm.is_available:
            return jsonify({"message": "LLM not available"}), 503

        if not db.is_available:
            return jsonify({"message": "Database not available"}), 503

        question = request.get_data(as_text=True)

        if question:
            experts_recommendation = llm.get_experts_recommendation(question)
            response = {"experts": []}

            for generic_profile in experts_recommendation:
                response["experts"].append(
                    {
                        "category": generic_profile,
                        "recommendation": [
                            {
                                "expert": User.query.filter(User.email == expert_email).first(),
                                "score": experts_recommendation[generic_profile]['scores'][i]
                            } for i, expert_email in enumerate(experts_recommendation[generic_profile]['expert_emails'])
                        ]
                    }
                )

            if response:
                return response, 200
            else:
                return jsonify({"message": "No experts were found matching your query"}), 404
        else:
            return jsonify({"message": "No question provided"}), 400

    except Exception as e:
        app_logger.error(msg=str(e), exc_info=True)
        return jsonify({"message": "An error occurred while searching for experts related to your request."}), 500


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
        app_logger.error(msg=str(e), exc_info=True)
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
        app_logger.error(msg=str(e), exc_info=True)
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
        app_logger.error(msg=str(e), exc_info=True)
        return jsonify({"message": "An error occurred while extracting keywords from user expertise."}), 500


@app.route('/delete_user/<int:user_id>', methods=['DELETE'], endpoint='delete_user')
@require_api_key
def delete_user(user_id):
    try:
        if not db.is_available:
            return jsonify({"message": "Database not available"}), 503

        # Get the user based on the provided ID
        user = db.session.get(User, user_id)

        if user:
            db.delete_user_from_csv(user.email)
            db.session.delete(user)
            db.session.commit()
            return jsonify({'message': 'User deleted successfully'}), 200
        else:
            return jsonify({'message': 'User not found'}), 404

    except Exception as e:
        db.session.rollback()
        app_logger.error(msg=str(e), exc_info=True)
        return jsonify({"message": "An error occurred while deleting a user from the database."}), 500


@app.route('/update_user/<int:user_id>', methods=['PUT'], endpoint='update_user')
@require_api_key
def update_user(user_id):
    try:
        if not db.is_available:
            return jsonify({"message": "Database not available"}), 503

        # Get the user based on the provided ID
        user = db.session.get(User, user_id)

        if user:
            request_data = request.get_json()

            db.update_user_in_csv(user.email, request_data)

            for key, value in request_data.items():
                setattr(user, key, value)
                if key == "skills":
                    setattr(user, "tags", ', '.join(llm.get_keywords(value)))

            db.session.commit()

            return jsonify({'message': 'User information updated successfully'}), 200
        else:
            return jsonify({'message': 'User not found'}), 404

    except Exception as e:
        db.session.rollback()
        app_logger.error(msg=str(e), exc_info=True)
        return jsonify({"message": "An error occurred while updating user information in the database."}), 500


@app.route('/download_csv', methods=['GET'], endpoint='download_csv')
@require_api_key
def download_csv():
    try:
        csv_file_path = SERVER_SETTINGS['users_csv_file']

        if not os.path.exists(csv_file_path):
            return jsonify({'message': 'CSV file not found on the server.'}), 404

        download_filename = Path(csv_file_path).name

        return send_file(
            csv_file_path,
            as_attachment=True,
            download_name=download_filename,
            mimetype='text/csv'
        )

    except Exception as e:
        app_logger.error(msg=str(e), exc_info=True)
        return jsonify({"message": "An error occurred while downloading the csv file."}), 500


@app.route('/upload_csv', methods=['POST'], endpoint='upload_csv_file')
@require_api_key
def upload_csv_file():
    try:
        if 'csv_file' not in request.files:
            return jsonify({"message": "No file part"}), 400

        file = request.files['csv_file']

        if file.filename == '':
            return jsonify({"message": "No selected file"}), 400

        if file:
            resources_path = os.path.abspath(SERVER_SETTINGS['resources_directory'])

            if not os.path.exists(resources_path):
                os.makedirs(resources_path)

            file.save(SERVER_SETTINGS["users_csv_file"])
            db.update(SERVER_SETTINGS["users_csv_file"])

            if not db.is_available:
                raise Exception("Database update from uploaded file failed.")

            return jsonify({"message": "CSV file uploaded and database updated successfully"}), 200

    except Exception as e:
        app_logger.error(msg=str(e), exc_info=True)
        return jsonify({"message": "File upload failed. An error occurred while uploading the csv file or updating the database."}), 500


@app.route('/download_user_photo/<int:user_id>', methods=['GET'], endpoint='download_user_photo')
@require_api_key
def download_user_photo(user_id):
    try:
        if not db.is_available:
            return jsonify({"message": "Database not available"}), 503

        user = db.session.get(User, user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        if not user.profile_photo:
            return jsonify({'message': 'User does not have a profile photo.'}), 404

        user_photo_path = os.path.join(SERVER_SETTINGS['user_photos_directory'], user.profile_photo)

        if not os.path.exists(user_photo_path):
            return jsonify({'message': 'User profile photo not found on the server.'}), 404

        return send_file(
            user_photo_path,
            as_attachment=True,
            download_name=user.profile_photo,
            mimetype='image/png'
        )

    except Exception as e:
        app_logger.error(msg=str(e), exc_info=True)
        return jsonify({"message": "An error occurred while downloading the user photo profile."}), 500


if __name__ == '__main__':
    init_server()
    app.run(
        debug=True,
        host='0.0.0.0',
        port=80
    )
