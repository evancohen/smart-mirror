#!/bin/bash

# Any subsequent(*) commands which fail will cause the shell script to exit immediately
set -e

# Supported versions of node: v4.x, v5.x
NODE_VERSION="v4.*\|v5.*"

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

printf "This script will install the smart-mirror and it's dependencies.\n"

# Ensure the use would like to start the install
read -r -p "Would you like to continue? [y/N] " response
if [[ $response =~ ^([yY][eE][sS]|[yY])$ ]]
then
    printf "Excellent! $(tput setaf 9)Please do not exit this script until it is complete.$(tput sgr0)\n"
else
    exit 1
fi

printf "\n"
read -r -p "[Requires Reboot] Would you like to automoticlly rotate your monitor? [y/N]" rotateResponse
if [[ $rotateResponse =~ ^([yY][eE][sS]|[yY])$ ]]
then
   # Rotate Display (replace the display_rotate line with display_rotate=1)
    sed -i -e '$a\
\
#Rotate the display (smart-mirror)\
display_rotate=1' /boot/config.txt
fi

printf "\nChecking for node...\n"
node --version | grep ${NODE_VERSION}
if [[ $? != 0 ]] ;
then
    # Install Node
    printf "$(tput setaf 12)Downloading node$(tput sgr0)\n"
    wget https://nodejs.org/dist/v4.0.0/node-v4.0.0-linux-armv7l.tar.gz
    tar -xvf node-v4.0.0-linux-armv7l.tar.gz 
    cd node-v4.0.0-linux-armv7l
    
    # Copy to /usr/local
    printf "$(tput setaf 12)Installing node$(tput sgr0)\n"
    sudo cp -R * /usr/local/
    
    # Clean up after ourselvs
    cd ..
    rm node-v4.0.0-linux-armv7l.tar.gz
    rm -R node-v4.0.0-linux-armv7l
    printf "$(tput setaf 10)node is now installed!$(tput sgr0)\n"
else
    printf "$(tput setaf 10)node is already installed, great job!$(tput sgr0)\n"
fi

# Getting the code
printf "\n$(tput setaf 12)Cloning Git Repo$(tput sgr0)\n"
cd /home/$SUDO_USER
sudo -u $SUDO_USER git clone https://github.com/evancohen/smart-mirror.git
printf "\n$(tput setaf 10)smart-mirror code is now downloaded$(tput sgr0)\n"

cd smart-mirror

printf "$(tput setaf 12)generating config template$(tput sgr0)\n"
sudo -u $SUDO_USER cp config.example.js config.js

# Install package to hide the mouse when inactive
printf "\n$(tput setaf 12)Installing unclutter$(tput sgr0)\n"
sudo apt-get install unclutter

# Apply LXDE unclutter autostart 
sed -i -e '$a\
\
#Hide the mouse when inactive (smart-mirror)\
unclutter -idle 0.1 -root' /etc/xdg/lxsession/LXDE/autostart

printf "\n$(tput setaf 12)Installing smart-mirror dependencies...$(tput sgr0)\n"
printf "$(tput setaf 11)This may take a while. Go grab a beer :)$(tput sgr0)\n"
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