from flask import Flask
from app import app, init_server


def start_server() -> Flask:
    init_server()
    return app


if __name__ == "__main__":
    server = start_server()
    server.run(
        debug=False,
        host='0.0.0.0',
        port=80
    )
