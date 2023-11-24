#!/bin/bash

# Makes a pipe terminate on the first encountered error instead of passing that along to the next command in the chain.
set -euo pipefail

LOG_FILE="setup.log"

log_error() {
    local error_message="$1"
    echo "$(date): $error_message" >> "$LOG_FILE"
}

check_root_privileges() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Error: This script must be run as root."
        exit 1
    fi
}

check_os_arch() {
    # Get the OS name
    SYSTEM_NAME=$(uname -s)

    case "$SYSTEM_NAME" in
    Linux*)
        # Get information about the Linux distribution
        DISTRO_INFO=$(lsb_release -d)
        if [[ $DISTRO_INFO != *"Ubuntu 22.04"* ]]; then
            log_error "Error: This script is intended for Ubuntu 22.04 only."
            exit 1
        fi

        # Check if the architecture is x86_64
        ARCH=$(uname -m)
        if [[ $ARCH != "x86_64" ]]; then
            log_error "Error: This script is intended for x86_64 architecture only."
            exit 1
        fi
        ;;
    *)
        log_error "Error: This script is not supported on this operating system."
        exit 1
        ;;
    esac
}

update_package_list() {
    if ! sudo apt-get -o DPkg::Lock::Timeout=60 update -y 2>&1 | sudo tee -a "$LOG_FILE" > /dev/null; then
        log_error "Failed to update package list, please try again."
        exit 1
    fi
}

install_package() {
    local package_name="$1"
    if ! command -v "$package_name" &>/dev/null; then
        echo "Installing $package_name..."
        if ! sudo apt-get -o DPkg::Lock::Timeout=60 install "$package_name" -y 2>&1 | sudo tee -a "$LOG_FILE" > /dev/null; then
            log_error "Failed to install $package_name, please try again."
            exit 1
        fi
        echo "$package_name installed."
    fi
}

install_dependencies() {
    install_package "python3.10"
    install_package "nginx"
    install_package "openssl"
    install_package "lshw"
    install_package "curl"

    if ! dpkg -l | grep -q "python3.10-venv"; then
        echo "Installing python3.10-venv..."
        if ! sudo apt-get -o DPkg::Lock::Timeout=60 install python3.10-venv -y 2>&1 | sudo tee -a "$LOG_FILE" > /dev/null; then
            log_error "Failed to install python3.10-venv, please try again."
            exit 1
        fi
        echo "Python 3.10-venv installed."
    fi
}

generate_self_signed_key_cert_pair() {
    # Set the certificate and key file paths
    KEY_FILE_PATH="/etc/ssl/private/nginx-selfsigned.key"
    CERT_FILE_PATH="/etc/ssl/certs/nginx-selfsigned.crt"

    if [[ ! -f $KEY_FILE_PATH ]] || [[ ! -f $CERT_FILE_PATH ]]; then
        # Get the public hostname of the ec2 instance
        PUBLIC_HOSTNAME=$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)

        # Set the certificate subject information
        SUBJECT="/C=CA/ST=Quebec/L=Montreal/O=CHUM/OU=EIAS-CPIAS/CN=$PUBLIC_HOSTNAME"

        # Generate a self-signed certificate and key
        if ! sudo openssl req -x509 -newkey rsa:2048 -keyout "$KEY_FILE_PATH" -out "$CERT_FILE_PATH" -days 365 -nodes -subj "$SUBJECT" 2>&1 | sudo tee -a "$LOG_FILE" > /dev/null; then
            log_error "Failed to generate self-signed key and certificate pair, please try again."
            exit 1
        fi
    fi
}

echo "Checking root privileges..."
check_root_privileges
echo "Done."

echo "Checking OS and architecture..."
check_os_arch
echo "Done."

echo "Updating package list..."
update_package_list
echo "Done."

echo "Installing dependencies..."
install_dependencies
echo "Done."

echo "Installing Ollama..."
sudo curl -sSL https://ollama.ai/install.sh | sudo sh 2>&1 | sudo tee -a "$LOG_FILE" > /dev/null
sleep 5
echo "Done."

echo "Pulling Mistral LLM..."
ollama pull mistral:instruct 2>&1 | sudo tee -a "$LOG_FILE" > /dev/null
echo "Done."

echo "Setting up the server..."
python3.10 -m venv venv
source venv/bin/activate
pip install -r requirements.txt 2>&1 | sudo tee -a "$LOG_FILE" > /dev/null
deactivate
echo "Done."

echo "Setting up a systemd service for the server..."
sudo cp src/server.service /etc/systemd/system
sudo systemctl start server
sudo systemctl enable server
echo "Done."

echo "Generating self-signed key and certificate pair..."
generate_self_signed_key_cert_pair
echo "Done."

echo "Generating Diffie-Hellman key exchange parameters (this will take a while)..."
sudo openssl dhparam -out /etc/nginx/dhparam.pem 4096 2>&1 | sudo tee -a "$LOG_FILE" > /dev/null
echo "Done."

echo "Setting up TLS/SSL..."
sudo cp tls_ssl/self-signed.conf /etc/nginx/snippets
sudo cp tls_ssl/ssl-params.conf /etc/nginx/snippets
echo "Done."

echo "Setting up nginx..."
sudo cp src/server.conf /etc/nginx/sites-available
sudo ln -s /etc/nginx/sites-available/server.conf /etc/nginx/sites-enabled 2>&1 | sudo tee -a "$LOG_FILE" > /dev/null
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
echo "Done."

echo "Setting up permissions..."
sudo chmod 755 /home/ubuntu
echo "Done."

echo "Server installation is now complete. Your machine must be restarted."
