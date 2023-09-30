import os

from dotenv import load_dotenv
from flask import request, jsonify

load_dotenv()


def require_api_key(view_func):
    def decorated(*args, **kwargs):
        api_key = request.headers.get('Authorization')

        if api_key is not None and api_key == os.getenv('API_KEY'):
            return view_func(*args, **kwargs)
        else:
            return jsonify({'error': 'Unauthorized'}), 401

    return decorated
