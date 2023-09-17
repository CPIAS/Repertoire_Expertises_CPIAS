import multiprocessing

# Change this to the desired host and port
bind = '0.0.0.0:80'
workers = multiprocessing.cpu_count() * 2 + 1

# Enable SSL with SSL certificate and private key
# certfile = '/path/to/your/certificate.crt'
# keyfile = '/path/to/your/private.key'

# Secure the application by setting a secret key
# secretkey = 'your_secret_key_here'
