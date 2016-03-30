#!/bin/bash

# Supported versions of node: v4.x, v5.x
NODE_VERSION="v4.*\|v5.*"

# Ensure we are not using sudo (this could cause bad things to happen)
if [ "$(whoami)" == "root" ];
then
	echo "Sorry, this script should not be run with 'sudo'."
	exit 1
fi

cat << "EOF"
 ________  _____ ______   ________  ________  _________         
|\   ____\|\   _ \  _   \|\   __  \|\   __  \|\___   ___\       
\ \  \___|\ \  \\\__\ \  \ \  \|\  \ \  \|\  \|___ \  \_|       
 \ \_____  \ \  \\|__| \  \ \   __  \ \   _  _\   \ \  \        
  \|____|\  \ \  \    \ \  \ \  \ \  \ \  \\  \|   \ \  \       
    ____\_\  \ \__\    \ \__\ \__\ \__\ \__\\ _\    \ \__\      
   |\_________\|__|     \|__|\|__|\|__|\|__|\|__|    \|__|      
   \|_________|                                                 
                                                                
 _____ ______   ___  ________  ________  ________  ________     
|\   _ \  _   \|\  \|\   __  \|\   __  \|\   __  \|\   __  \    
\ \  \\\__\ \  \ \  \ \  \|\  \ \  \|\  \ \  \|\  \ \  \|\  \   
 \ \  \\|__| \  \ \  \ \   _  _\ \   _  _\ \  \\\  \ \   _  _\  
  \ \  \    \ \  \ \  \ \  \\  \\ \  \\  \\ \  \\\  \ \  \\  \| 
   \ \__\    \ \__\ \__\ \__\\ _\\ \__\\ _\\ \_______\ \__\\ _\ 
    \|__|     \|__|\|__|\|__|\|__|\|__|\|__|\|_______|\|__|\|__|

EOF

echo "This script will install the smart-mirror and it's dependencies."


read -r -p "Would you like to continue? [y/N] " response
if [[ $response =~ ^([yY][eE][sS]|[yY])$ ]]
then
    echo "Excellent!"
else
    exit 1
fi

echo "Checking for node"
node --version | grep ${NODE_VERSION}
if [[ $? != 0 ]] ;
then
    # Install Node
    echo "$(tput setaf 9)Downloading Node$(tput sgr0)"
    wget https://nodejs.org/dist/v4.0.0/node-v4.0.0-linux-armv7l.tar.gz
    tar -xvf node-v4.0.0-linux-armv7l.tar.gz 
    cd node-v4.0.0-linux-armv7l
    
    # Copy to /usr/local
    echo "$(tput setaf 9)Installing Node$(tput sgr0)"
    sudo cp -R * /usr/local/
    
    # Clean up after ourselvs
    cd ..
    rm node-v4.0.0-linux-armv7l.tar.gz
    rm -R node-v4.0.0-linux-armv7l
    echo "$(tput setaf 10)Node is now installed!$(tput sgr0)"
else
    echo "$(tput setaf 10)node is already installed, great job!$(tput sgr0)"
fi

# Getting the code
echo "$(tput setaf 9)Cloning Git Repo$(tput sgr0)"
cd ~
git clone https://github.com/evancohen/smart-mirror.git
echo "$(tput setaf 10)smart-mirror code is now downloaded$(tput sgr0)"

cd smart-mirror

echo "$(tput setaf 9)Creating Mirror Config$(tput sgr0)"
cp config.example.js config.js

# Install package to hide the mouse when inactive
echo "$(tput setaf 9)Installing unclutter$(tput sgr0)"
sudo apt-get install unclutter

# Apply LXDE unclutter autostart 
sed -i -e '$a\
unclutter -idle 0.1 -root' /etc/xdg/lxsession/LXDE/autostart

# Rotate Display
sed -i -e '$a\
display_rotate=1' /boot/config.txt

echo "$(tput setaf 9)Installing smart-mirror dependencies...$(tput sgr0)"
echo "$(tput setaf 11)This may take a bit$(tput sgr0)"
npm install
echo "$(tput setaf 10)The smart-mirror is now installed!$(tput sgr0)"

# Launching Smart Mirror App
npm start

exit 0