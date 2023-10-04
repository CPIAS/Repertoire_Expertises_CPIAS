import concurrent.futures
import csv
import os
from concurrent.futures import Future
from datetime import datetime, timezone, timedelta
from pathlib import Path
from flask import Flask, jsonify, request, render_template
from ai import LLM
from decorators import require_api_key
from models import db, User
from flask_cors import CORS

###################################################################################################################
#                                             GLOBAL VARIABLES                                                    #
###################################################################################################################

app = Flask(__name__, template_folder='../templates')
CORS(app)  # Initialize CORS with default options, allowing requests from any origin. To be modified for a production environment.
database_path = os.path.abspath('../database')
llm = LLM(Path("../raw_data/expertise_extended_english_renamed.csv"))
llm_is_ready = False


###################################################################################################################
#                                                 METHODS                                                         #
###################################################################################################################

def is_valid_date_format(date_string, date_format):
    try:
        datetime.strptime(date_string, date_format)
        return True
    except ValueError:
        return False


def init_llm():
    try:
        global llm
        llm.init()
    except:
        return False
    else:
        return True


def init_database():
    global database_path
    global app

    if not os.path.exists(database_path):
        os.makedirs(database_path)

    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{database_path}/users.db"
    db.init_app(app)

    with app.app_context():
        db.create_all()


###################################################################################################################
#                                                 ROUTES                                                          #
###################################################################################################################

@app.route('/', methods=['GET'], endpoint='index')
def index():
    formatted_datetime = datetime.now(timezone(-timedelta(hours=4), 'EDT')).strftime("%Y-%m-%d %H:%M:%S")
    return render_template('index.html', formatted_datetime=formatted_datetime)


@app.route('/upload', methods=['POST'], endpoint='upload_csv_file')
@require_api_key
def upload_csv_file():
    try:
        if 'csv_file' not in request.files:
            return jsonify({"message": "No file part"}), 400

        file = request.files['csv_file']

        if file.filename == '':
            return jsonify({"message": "No selected file"}), 400

        if file:
            resources_path = os.path.abspath('../resources')

            if not os.path.exists(resources_path):
                os.makedirs(resources_path)

            file_path = os.path.join(resources_path, file.filename)
            file.save(file_path)

            with open(file_path, 'r') as csv_file:
                csv_file_reader = csv.reader(csv_file)
                next(csv_file_reader)  # Skip the header row.
                db.session.query(User).delete()

                for row in csv_file_reader:
                    user = User(
                        user_id=int(row[0]) if str.isnumeric(row[0]) else None,
                        subscription_date=datetime.strptime(row[1], "%m-%d-%Y %H:%M:%S") if is_valid_date_format(row[1],
                                                                                                                 "%m-%d-%Y %H:%M:%S") else None,
                        first_name=row[2],
                        last_name=row[3],
                        email=row[4],
                        membership_category=row[5],
                        membership_category_other=row[6],
                        job_position=row[7],
                        affiliation_organization=row[8],
                        affiliation_organization_other=row[9],
                        skills=row[10],
                        years_experience_ia=float(row[11]) if str.isnumeric(row[11]) else None,
                        years_experience_healthcare=float(row[12]) if str.isnumeric(row[12]) else None,
                        community_involvement=row[13],
                        suggestions=row[14]
                    )
                    db.session.add(user)

                db.session.commit()

            return jsonify({"message": "CSV file uploaded and database populated successfully"}), 200
    except:
        db.session.rollback()
        return jsonify({"message": "File upload failed. An error occurred while uploading the csv file or populating the database."}), 500


@app.route('/users', methods=['GET'], endpoint='get_users')
@require_api_key
def get_users():
    users = User.query.all()
    if users:
        return users, 200
    else:
        return jsonify({"message": "Empty database"}), 404


@app.route('/users/<int:user_id>', methods=['GET'], endpoint='get_user')
@require_api_key
def get_user(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify(user), 200
    else:
        return jsonify({"message": "User not found"}), 404


@app.route('/search', methods=['POST'], endpoint='search')
@require_api_key
def search():
    try:
        global llm
        global llm_is_ready

        if not llm_is_ready:
            return jsonify({"message": "LLM not available"}), 503

        question = request.get_data(as_text=True)

        if question:
            user_ids: list[int] = llm.query(question)
            users = User.query.filter(User.user_id.in_(user_ids)).all()

            if users:
                return users, 200
            else:
                return jsonify({"message": "No users were found matching your query"}), 404
        else:
            return jsonify({"message": "No question provided"}), 400

    except:
        return jsonify({"message": "An error occurred while searching for the answer to the question."}), 500


###################################################################################################################
#                                      INITIALIZING SERVER SERVICES                                               #
###################################################################################################################

init_database()

with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
    future = executor.submit(init_llm)


    def callback(fut: Future[bool]):
        global llm_is_ready
        llm_is_ready = fut.result()


    future.add_done_callback(callback)

if __name__ == '__main__':
    app.run(
        debug=True,
        host='0.0.0.0',
        port=80
    )
