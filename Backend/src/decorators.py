import os
from dotenv import load_dotenv
from flask import request, jsonify

load_dotenv()


def require_api_key(view_func):
    """
        Decorator function to enforce API key authentication for a specific view function.

        This decorator checks the 'Authorization' header in the incoming request for a valid API key.
        If a valid API key is present, the decorated view function is executed. Otherwise, it returns
        a 401 Unauthorized response.

        Args:
            view_func (callable): The view function to decorate.

        Returns:
            callable: The decorated view function.

        Example:
            @app.route('/protected/resource')\n
            @require_api_key\n
            def protected_resource():
                # This view function will only be executed if a valid API key is provided.\n
                return jsonify({'message': 'Access granted!'})

    """

    def decorated(*args, **kwargs):
        api_key = request.headers.get('Authorization')

        if api_key is not None and api_key == os.getenv('API_KEY'):
            return view_func(*args, **kwargs)
        else:
            return jsonify({'error': 'Unauthorized'}), 401

    return decorated
