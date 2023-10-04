#!/bin/bash

check_os_arch() {
    # Get the OS name
    SYSTEM_NAME=$(uname -s)

    case "$SYSTEM_NAME" in
    Linux*)
        # Get information about the Linux distribution
        DISTRO_INFO=$(lsb_release -d)
        if [[ $DISTRO_INFO != *"Ubuntu 22.04"* ]]; then
            echo "Error: This script is intended for Ubuntu 22.04 only."
            exit 1
        fi

        # Check if the architecture is x86_64
        ARCH=$(uname -m)
        if [[ $ARCH != "x86_64" ]]; then
            echo "Error: This script is intended for x86_64 architecture only."
            exit 1
        fi
        ;;
    *)
        echo "Error: This script is not supported on this operating system."
        exit 1
        ;;
    esac
}

update_package_list() {
    if ! sudo apt-get -o DPkg::Lock::Timeout=60 update -y &>/dev/null; then
        echo "Failed to update package list, please try again."
        exit 1
    fi
}

install_dependencies() {
    if ! command -v python3.10 &>/dev/null; then
        echo "Installing python3.10..."
        if ! sudo apt-get -o DPkg::Lock::Timeout=60 install python3.10 -y &>/dev/null; then
            echo "Failed to install python3.10, please try again."
            exit 1
        fi
        echo "Python 3.10 installed."
    fi

    if ! dpkg -l | grep -q "python3.10-venv"; then
        echo "Installing python3.10-venv..."
        if ! sudo apt-get -o DPkg::Lock::Timeout=60 install python3.10-venv -y &>/dev/null; then
            echo "Failed to install python3.10-venv, please try again."
            exit 1
        fi
        echo "Python 3.10-venv installed."
    fi

    if ! command -v nginx &>/dev/null; then
        echo "Installing Nginx..."
        if ! sudo apt-get -o DPkg::Lock::Timeout=60 install nginx -y &>/dev/null; then
            echo "Failed to install Nginx, please try again."
            exit 1
        fi
        echo "Nginx installed."
    fi

    if ! command -v openssl &>/dev/null; then
        echo "Installing openssl..."
        if ! sudo apt-get -o DPkg::Lock::Timeout=60 install openssl -y &>/dev/null; then
            echo "Failed to install openssl, please try again."
            exit 1
        fi
        echo "openssl installed."
    fi

    if ! command -v lshw &>/dev/null; then
        echo "Installing GPU driver..."
        if ! sudo apt-get -o DPkg::Lock::Timeout=60 install lshw -y &>/dev/null; then
            echo "Failed to install GPU driver, please try again."
            exit 1
        fi
        echo "GPU driver installed."
    fi

    if ! command -v curl &>/dev/null; then
        echo "Installing curl..."
        if ! sudo apt-get -o DPkg::Lock::Timeout=60 install curl -y &>/dev/null; then
            echo "Failed to install curl, please try again."
            exit 1
        fi
        echo "curl installed."
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
        if ! sudo openssl req -x509 -newkey rsa:2048 -keyout "$KEY_FILE_PATH" -out "$CERT_FILE_PATH" -days 365 -nodes -subj "$SUBJECT" &>/dev/null; then
            echo "Failed to generate self-signed key and certificate pair, please try again."
            exit 1
        fi
    fi
}

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
sudo curl https://ollama.ai/install.sh | sh
ollama serve &
sleep 5
echo "Done."

echo "Pulling llama2 LLM..."
ollama pull llama2:7b-chat-q4_0
echo "Done."

echo "Setting up the server..."
python3.10 -m venv venv
source venv/bin/activate
pip install -r requirements.txt &>/dev/null
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
sudo openssl dhparam -out /etc/nginx/dhparam.pem 4096 &>/dev/null
echo "Done."

echo "Setting up TLS/SSL..."
sudo cp tls_ssl/self-signed.conf /etc/nginx/snippets
sudo cp tls_ssl/ssl-params.conf /etc/nginx/snippets
echo "Done."

echo "Setting up nginx..."
sudo cp src/server.conf /etc/nginx/sites-available
sudo ln -s /etc/nginx/sites-available/server.conf /etc/nginx/sites-enabled &>/dev/null
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
echo "Done."

echo "Setting up permissions..."
sudo chmod 755 /home/ubuntu
echo "Done."
