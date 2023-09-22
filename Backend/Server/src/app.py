import csv
from datetime import datetime, timezone, timedelta

from flask import Flask, jsonify, request

from models import db, User

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db.init_app(app)
with app.app_context():
    db.create_all()


@app.route('/', methods=['GET'])
def welcome():
    formatted_datetime = datetime.now(timezone(-timedelta(hours=4), 'EDT')).strftime("%Y-%m-%d %H:%M:%S")
    response = (f"Welcome to the server of the search engine and networking platform in the healthcare AI field.<br>"
                f"Current Datetime: {formatted_datetime}")
    return response, 200, {'Content-Type': 'text/html; charset=utf-8'}


@app.route('/upload', methods=['POST'])
def upload_csv_file():
    try:
        if 'csv_file' not in request.files:
            return jsonify({"message": "No file part"}), 400

        file = request.files['csv_file']

        if file.filename == '':
            return jsonify({"message": "No selected file"}), 400

        if file:
            file.save(file.filename)

            with open(file.filename, 'r') as csv_file:
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


@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return users


@app.route('/users/<int:user_id>', methods=['GET'])
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
