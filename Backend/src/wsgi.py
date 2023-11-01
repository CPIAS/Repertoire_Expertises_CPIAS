from app import app, init_server, start_scheduled_tasks_thread


def start_server():
    init_server()
    start_scheduled_tasks_thread()
    return app


if __name__ == "__main__":
    server = start_server()
    server.run(
        debug=False,
        host='0.0.0.0',
        port=80
    )
