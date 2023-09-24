#!/bin/bash

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
}

echo "Updating package list..."
update_package_list
echo "Done."

echo "Installing dependencies..."
install_dependencies
echo "Done."

echo "Setting up the server..."
python3.10 -m venv ../venv
source ../venv/bin/activate
pip install -r requirements.txt &>/dev/null;
deactivate
echo "Done."

echo "Setting up a systemd service for the server..."
sudo cp server.service /etc/systemd/system
sudo systemctl start server
sudo systemctl enable server
echo "Done."

echo "Setting up nginx..."
sudo cp server.conf /etc/nginx/sites-available
sudo ln -s /etc/nginx/sites-available/server.conf /etc/nginx/sites-enabled &>/dev/null;
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
echo "Done."

echo "Setting up permissions..."
sudo chmod 755 /home/ubuntu
echo "Done."
