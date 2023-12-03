from flask import Flask
from app import app, init_server


def start_server() -> Flask:
    """
        Initializes and starts the Flask server.

        This method is responsible for initializing the server using the `init_server` function and returning the Flask app instance.

        Returns:
            Flask: The initialized Flask app instance.
    """

    init_server()
    return app


if __name__ == "__main__":
    server = start_server()
    server.run(
        debug=False,
        host='0.0.0.0',
        port=80
    )
