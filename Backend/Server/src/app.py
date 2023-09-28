import csv
import os
from datetime import datetime, timezone, timedelta

from flask import Flask, jsonify, request, render_template

from decorators import require_api_key
from models import db, User

database_path = os.path.abspath('../database')

if not os.path.exists(database_path):
    os.makedirs(database_path)

app = Flask(__name__, template_folder='../templates')
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{database_path}/users.db"
db.init_app(app)

with app.app_context():
    db.create_all()


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
                        user_id=int(row[0]),
                        first_name=row[1],
                        last_name=row[2],
                        subscription_date=datetime.strptime(row[3], "%Y-%m-%d"),
                        email=row[4],
                        membership_category=row[5],
                        membership_category_other=row[6],
                        job_position=row[7],
                        affiliation_organization=row[8],
                        affiliation_organization_other=row[9],
                        skills=row[10],
                        years_experience_ia=int(row[11]),
                        years_experience_healthcare=int(row[12]),
                        community_involvement=row[13],
                        suggestions=row[14]
                    )
                    db.session.add(user)

                db.session.commit()

            return jsonify({"message": "CSV file uploaded and database populated successfully"}), 200
    except Exception:
        db.session.rollback()
        return jsonify({"message": "File upload failed. An error occurred while uploading the csv file or populating the database."}), 500


@app.route('/users', methods=['GET'], endpoint='get_users')
@require_api_key
def get_users():
    users = User.query.all()
    return users


@app.route('/users/<int:user_id>', methods=['GET'], endpoint='get_user')
@require_api_key
def get_user(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify(user)
    else:
        return jsonify({"message": "User not found"}), 404


if __name__ == '__main__':
    app.run(
        debug=True,
        host='0.0.0.0',
        port=80
    )
