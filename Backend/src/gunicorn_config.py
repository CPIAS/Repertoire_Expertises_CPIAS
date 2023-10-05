import multiprocessing

# Change this to the desired host and port
bind = '0.0.0.0:80'
workers = multiprocessing.cpu_count() * 2 + 1
