import multiprocessing
import subprocess
from gunicorn.arbiter import Arbiter
from settings import SERVER_SETTINGS
from app import app_logger

# Change this to the desired host and port
bind = 'unix:/home/ubuntu/project_4/Backend/src/server.sock'
workers = multiprocessing.cpu_count() * 2 + 1

# Set appropriate timeout values
timeout = 180  # You may adjust this based on the expected response time of your app

# Unix socket permissions
umask = 0o007

# Logging configuration
loglevel = 'info'
accesslog = SERVER_SETTINGS['access_log_file']
errorlog = SERVER_SETTINGS['error_log_file']

# Enable error logging to stderr in addition to the log file
capture_output = True

# Improve Gunicorn process management
max_requests = 1000  # Restart worker processes after serving this many requests
max_requests_jitter = 50  # Randomly add jitter to the max_requests value to prevent all workers from restarting simultaneously

# Set the user and group that the server will run as
# This enhances security by running Gunicorn as a non-privileged user
# Change these values to match your deployment environment
user = 'ubuntu'
group = 'ubuntu'

# Adapt the worker class to your needs: sync, gthread, gevent...
worker_class = 'sync'

# Enable preload to load the application code before forking worker processes
preload_app = True

# Configure Gunicorn to gracefully restart workers on code changes
reload = False

# The WSGI application entry point
wsgi_app = 'wsgi:start_server()'


def on_exit(server: Arbiter):
    # Command to kill the process using port 5555 used by ZeroMQ
    command = "/usr/bin/fuser -k 5555/tcp"
    try:
        app_logger.info("Releasing Port 5555 used by ZeroQM...")
        subprocess.run(command, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except subprocess.CalledProcessError as e:
        app_logger.error(msg=str(e), exc_info=True)
