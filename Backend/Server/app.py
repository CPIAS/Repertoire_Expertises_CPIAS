import datetime

from flask import Flask

app = Flask(__name__)
project_name = 'Research engine and networking platform in the healthcare AI field.'


@app.route('/')
def get_infos():
    formatted_datetime = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    response = f"Project Name: {project_name}<br>Current Datetime: {formatted_datetime}"
    return response, 200, {'Content-Type': 'text/html; charset=utf-8'}


if __name__ == '__main__':
    app.run()
