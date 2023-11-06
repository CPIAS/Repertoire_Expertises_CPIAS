from app import app, init_server, start_scheduled_tasks_thread

if __name__ == "__main__":
    init_server()
    start_scheduled_tasks_thread()
    app.run(
        debug=False,
        host='0.0.0.0',
        port=80
    )
