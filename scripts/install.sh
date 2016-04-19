#!/bin/bash

# Any subsequent(*) commands which fail will cause the shell script to exit immediately
set -e

# Supported versions of node: v4.x, v5.x
NODE_VERSION="v4.*\|v5.*"

# Terminal Colors
red=$'\e[1;31m'
grn=$'\e[1;32m'
yel=$'\e[1;33m'
blu=$'\e[1;34m'
mag=$'\e[1;35m'
cyn=$'\e[1;36m'
end=$'\e[0m'

# Ensure we are using sudo
if [ "$(whoami)" != "root" ];
then
	echo "This script requires root permissions, try: sudo ./${0##*/} "
	exit 0
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
  \ \  \    \ \  \ \  \ \  \\  \\ \  \\  \\ \  \\\  \ \  \\  \  
   \ \__\    \ \__\ \__\ \__\\ _\\ \__\\ _\\ \_______\ \__\\ _\ 
    \|__|     \|__|\|__|\|__|\|__|\|__|\|__|\|_______|\|__|\|__|

EOF

printf "%sThis script will install the smart-mirror and it's dependencies.\n"

# Ensure the use would like to start the install
read -r -p "Would you like to continue? [y/N] " response
if [[ $response =~ ^([yY][eE][sS]|[yY])$ ]]
then
    printf "%sExcellent! ${red}Please do not exit this script until it is complete.${end}\n"
else
    exit 1
fi

printf "%s\n"
read -r -p "[Requires Reboot] Would you like to automoticlly rotate your monitor? [y/N]" rotateResponse
if [[ $rotateResponse =~ ^([yY][eE][sS]|[yY])$ ]]
then
   # Rotate Display (replace the display_rotate line with display_rotate=1)
    sed -i -e '$a\
\
#Rotate the display (smart-mirror)\
display_rotate=1' /boot/config.txt
fi

printf "%s\nChecking for node...\n"
node --version | grep ${NODE_VERSION}
if [[ $? != 0 ]] ;
then
    # Install Node
    printf "%s{blu}Downloading node${end}\n"
    wget https://nodejs.org/dist/v4.0.0/node-v4.0.0-linux-armv7l.tar.gz
    tar -xvf node-v4.0.0-linux-armv7l.tar.gz 
    cd node-v4.0.0-linux-armv7l
    
    # Copy to /usr/local
    printf "%s{blu}Installing node${end}\n"
    sudo cp -R * /usr/local/
    
    # Clean up after ourselvs
    cd ..
    rm node-v4.0.0-linux-armv7l.tar.gz
    rm -R node-v4.0.0-linux-armv7l
    printf "%s$(tput setaf 10)node is now installed!${end}\n"
else
    printf "%s$(tput setaf 10)node is already installed, great job!${end}\n"
fi

# Getting the code
printf "%s\n{blu}Cloning Git Repo${end}\n"
cd /home/$SUDO_USER
sudo -u $SUDO_USER git clone https://github.com/evancohen/smart-mirror.git
printf "%s\n$(tput setaf 10)smart-mirror code is now downloaded${end}\n"

cd smart-mirror

printf "%s{blu}generating config template${end}\n"
sudo -u $SUDO_USER cp config.example.js config.js

# Install package to hide the mouse when inactive
printf "%s\n{blu}Installing unclutter${end}\n"
sudo apt-get install unclutter

# Apply LXDE unclutter autostart 
sed -i -e '$a\
\
#Hide the mouse when inactive (smart-mirror)\
unclutter -idle 0.1 -root' /etc/xdg/lxsession/LXDE-pi/autostart

printf "%s\n{blu}Installing smart-mirror dependencies...${end}\n"
printf "%s${yel}This may take a while. Go grab a beer :)${end}\n"
sudo -u $SUDO_USER npm install

# The mirror is now installed, yay!
cat << "EOF"

        |        The smart-mirror is now installed!
       / \       
      / _ \      Once you fill out your config you can start the mirror with:
     |.o '.|     npm start
     |'._.'|     
     |     |     To lean more, check out the documentation at:
   ,'|  |  |`.   docs.smart-mirror.io
  /  |  |  |  \
  |,-'--|--'-.|
  
EOF
# ASCII art found on http://textart.io/

exit 0