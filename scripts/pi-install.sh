#!/bin/bash

# Any subsequent(*) commands which fail will cause the shell script to exit immediately
set -e

# Supported versions of node: v4.x, v5.x
NODE_MINIMUM_VERSION="v4.0.0"
NODE_STABLE_VERSION="6.x"

# Compare node versions.
function check_version() { test "$(echo "$@" | tr " " "\n" | sort -V | head -n 1)" != "$1"; }
# Check to see if a command exists (if something is installed)
function command_exists () { type "$1" &> /dev/null ;}

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

ARCH=$(uname -m) 
# Check processor archetecture.
if [$ARCH != "armv7l" ]; then
	printf "%s${red} Unupported device!${end} The smart-mirror only works on the Pi 2 and 3"
	exit;
fi

printf "%sThis script will install the smart-mirror and it's dependencies.\n"

# Ensure the use would like to start the install
read -r -p "Would you like to continue? [y/N] " response
if [[ $response =~ ^([yY][eE][sS]|[yY])$ ]]; then
    printf "%sExcellent! ${red}Please do not exit this script until it is complete.${end}\n"
else
    exit 1
fi

# # Rotate the monitor
# printf "%s\n"
# read -r -p "Would you like to rotate your monitor? [y/N]" rotateResponse
# if [[ $rotateResponse =~ ^([yY][eE][sS]|[yY])$ ]]; then
#    # Rotate Display (replace the display_rotate line with display_rotate=1)
#     sed -i -e '$a\
# \
# #Rotate the display (smart-mirror)\
# display_rotate=1' /boot/config.txt
# fi

# Install native dependencies
printf "%s\n${blu}Installing native dependencies${end}\n"
sudo apt-get install curl wget git python-pyaudio python3-pyaudio sox unclutter

# Check if we need to install or upgrade Node.js.
printf "%s\n${blu}Checking current Node installation${end}\n"
NODE_INSTALL=false
if command_exists node; then
	NODE_CURRENT=$(node -v)
	printf "%sMinimum Node version: $NODE_MINIMUM_VERSION\n"
	printf "%sInstalled Node version: $NODE_CURRENT\n"
	if check_version $NODE_MINIMUM_VERSION $NODE_CURRENT; then
    	NODE_INSTALL=true
    	# If Node is already running then abort
    	if pgrep "node" > /dev/null; then
		    printf "%s${red}A node process is currently running. Unable to upgrade for you.${end}\n"
		    printf "Exit all Node processes and then restart this installer."
		    exit;
		fi
        printf "%sLooks like you need an upgrade. Taking care of that for you.\n"
	fi
else
	printf "%sNo Node installation found. Installing it for you.\n";
	NODE_INSTALL=true
fi
# Upgrade node if it is out of date
if $NODE_INSTALL; then
	printf "%sInstalling Node...\n"
	curl -sL https://deb.nodesource.com/setup_$NODE_STABLE_VERSION | sudo -E bash -
	sudo apt-get install -y nodejs
	printf "%sNode installation complete.\n"
fi

#Install magic mirror
cd /home/"$SUDO_USER"
if [ -d "$HOME/smart-mirror" ]; then
	printf "%s${red}Looks like the smart mirror is already installed.${end}\n"
	printf "%sPlease rename or remove the ${mag}smart-mirror${end} folder and re-run the installer.\n"
	printf "%sIf you want to upgrade your smart mirror run ${cyn}git pull${end} from the ~/smart-mirror directory.\n"
	exit;
fi

# Getting the code
printf "%s\n${blu}Cloning smart-mirror Git Repo${end}\n"
if sudo -u "$SUDO_USER" git clone https://github.com/evancohen/smart-mirror.git; then
    printf "%s${grn}smart-mirror code is now downloaded${end}\n"
else
    printf "%s${red}Unable to clone smart-mirror :( ${end}\n"
    exit;
fi

# Generate config and install dependencies
cd smart-mirror  || exit
printf "%s\n${blu}generating config template...${end}\n"
sudo -u "$SUDO_USER" cp config.example.js config.js

# Install smart-mirror dependencies
printf "%s\n${blu}Installing smart-mirror dependencies...${end}\n"
printf "%s${yel}This may take a while. Go grab a beer :)${end}\n"
if sudo -u "$SUDO_USER" npm install; then 
	printf "%s${grn}Dependency installation complete!${end}\n"
else
	printf "%s${red}Unable to install dependencies :( ${end}\n"
	exit;
fi

# Apply LXDE unclutter autostart (if we haven't already)
if ! grep -q '(smart-mirror)' /etc/xdg/lxsession/LXDE/autostart; then
    sed -i -e '$a\
\
#Hide the mouse when inactive (smart-mirror)\
unclutter -idle 0.1 -root' /etc/xdg/lxsession/LXDE/autostart
fi

# Disable the screensaver (if we haven't already)
if ! grep -q '(smart-mirror)' /home/"$SUDO_USER"/.config/lxsession/LXDE-pi/autostart; then
    sed -i -e '$a\
\
#Disable screen saver (smart-mirror)\
@xset s 0 0\
@xset s noblank\
@xset s noexpose\
@xset dpms 0 0 0' /home/"$SUDO_USER"/.config/lxsession/LXDE-pi/autostart
fi


# The mirror is now installed, yay!
cat << "EOF"

        |        The smart-mirror is now installed!
       / \       
      / _ \      Once you fill out your config you can start the mirror with:
     |.o '.|     > npm start
     |'._.'|     Or if you are running over SSH:
     |     |     > DISPLAY=:0 npm start
   ,'|  |  |`.   
  /  |  |  |  \  To lean more, check out the documentation at:
  |,-'--|--'-.|  http://docs.smart-mirror.io
  
EOF
# ASCII art found on http://textart.io/

exit 0
