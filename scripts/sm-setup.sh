set -e

# Supported versions of node: v4.x, v5.x
NODE_MINIMUM_VERSION="v4.0.0"
NODE_STABLE_VERSION="6.x"
INTERACTIVE=True
ASK_TO_REBOOT=0
CONFIG=$HOME/config.txt
#lx2=~/.config/lxsession/LXDE-pi/autostart
lx2=$HOME/autostart.config
#lx1=/etc/xdg/lxsession/LXDE/autostart
lx1=$HOME/autostart.etc
INSTALL_LOG=$HOME/sm-setup.log

# Terminal Colors
red=$'\e[1;31m'
grn=$'\e[1;32m'
yel=$'\e[1;33m'
blu=$'\e[1;34m'
mag=$'\e[1;35m'
cyn=$'\e[1;36m'
end=$'\e[0m'

set_config_var() {
  lua - "$1" "$2" "$3" <<EOF > "$3.bak"
local key=assert(arg[1])
local value=assert(arg[2])
local fn=assert(arg[3])
local file=assert(io.open(fn))
local made_change=false
for line in file:lines() do
  if line:match("^#?%s*"..key.."=.*$") then
    line=key.."="..value
    made_change=true
  end
  print(line)
end

if not made_change then
  print(key.."="..value)
end
EOF
mv "$3.bak" "$3"
}
# Compare node versions.
function check_version() { test "$(echo "$@" | tr " " "\n" | sort -V | head -n 1)" != "$1"; }

# Get the password from user for sudo
function do_getSudoPW() { sudoPass=$(whiptail --passwordbox "please enter your secret password" 8 78 --title "password dialog" 3>&1 1>&2 2>&3); }

# Check to see if a command exists (if something is installed)
function command_exists () { type "$1" &> /dev/null ; }

function do_6_rotateScreen() {
if [ "$INTERACTIVE" = True ]; then
    whiptail --yesno "Would you like to enable compensation for displays with overscan?" $DEFAULT 20 60 2
    RET=$?
  else
    RET=$1
  fi
  if [ $RET -eq $CURRENT ]; then
    ASK_TO_REBOOT=1
  fi
  if [ $RET -eq 0 ] ; then
    set_config_var disable_overscan 0 $CONFIG
    STATUS=enabled
  elif [ $RET -eq 1 ]; then
    set_config_var disable_overscan 1 $CONFIG
    STATUS=disabled
  else
    return $RET
  fi
}

function do_5_configKiosk() {

# Apply LXDE unclutter autostart (if we haven't already)
if ! sudo grep -q '(smart-mirror)' $lx1; then
    sudo sed -i -e '$a\
\
#Hide the mouse when inactive (smart-mirror)\
unclutter -idle 0.1 -root' $lx1
fi

# Disable the screensaver (if we haven't already)
if ! grep -q '(smart-mirror)' $lx2; then
    sed -i -e '$a\
\
#Disable screen saver (smart-mirror)\
@xset s 0 0\
@xset s noblank\
@xset s noexpose\
@xset dpms 0 0 0' $lx2
fi
}

function do_4_npmInstall() {
# Install smart-mirror dependencies
whiptail --msgbox "${blu}Installing smart-mirror dependencies...${end}
${yel}This may take a while. Go grab a beer :)${end}" 20 60 1
if [ -d "$HOME/smart-mirror" ]; then
  echo "=== Installing smart-mirror dependencies ===">>$INSTALL_LOG
  if cd ~/smart-mirror && npm install>>$INSTALL_LOG; then 
    echo "=== Dependency installation complete! ===">>$INSTALL_LOG
  	whiptail --msgbox "${grn}Dependency installation complete!${end}\n" 20 60 1
  else
    echo "=== Unable to install dependencies :( ===">>$INSTALL_LOG
  	whiptail --msgbox "${red}Unable to install dependencies :( ${end}\n" 20 60 1
  fi
else
  echo "=== smart-mirror folder not found.  ===">>$INSTALL_LOG
  echo "=== Unable to install dependencies :( ===">>$INSTALL_LOG
  whiptail --msgbox "${red}smart-mirror folder not found. 
  Unable to install dependencies :( ${end}\n" 20 60 1
fi
}

function do_3_cloneSmartMirror() {
# Add start commands in the user's bashrc.
echo "=== Start Step 3 Clone Mirror ===">>$INSTALL_LOG
echo "export MIRROR_HOME=~/smart-mirror" >> ~/.bashrc
echo "run_mirror () { ( cd \$MIRROR_HOME && DISPLAY=:0 npm \"\$@\" ); }" >> ~/.bashrc
echo "alias mirror=run_mirror" >> ~/.bashrc
cd ~ && source .bashrc
CLONE_MIRROR=false
PULL_MIRROR=false
cd ~
if [ -d "$HOME/smart-mirror" ]; then
  echo "   smart-mirror folder found.">>$INSTALL_LOG
	if ( whiptail --title "Installing Smart-Mirror Code" --yesno "Looks like the smart mirror is already installed.
Please rename or remove the ${mag}smart-mirror${end} folder and re-run the installer.
Do you want to upgrade your smart mirror by running ${cyn}git pull${end} from the ~/smart-mirror directory?" 20 60 ); then
      echo "=== Pull Smart-Mirror ===">>$INSTALL_LOG
      if cd $MIRROR_HOME && git pull>>$INSTALL_LOG; then
        PULL_MIRROR=true
      fi
  else
      echo "=== Do Not Pull Smart-Mirror ===">>$INSTALL_LOG
    if ( whiptail --title "Installing Smart-Mirror Code" --yesno "Do you want to rename the ~/smart-mirror directory and install Smart-Mirror Fresh?" 20 60 ); then
      newFolder=$(whiptail --inputbox "What do you want to rename the smart-mirror folder to? 20 60 smart-mirror" --title "Installing Smart-Mirror Code" 3>&1 1>&2 2>&3)
      echo "=== rename smart-mirror to $newFolder ===">>$INSTALL_LOG
      if mv ~/smart-mirror $newFolder; then
        echo "=== Rename Successfull ===">>$INSTALL_LOG
        CLONE_MIRROR=true
      fi
    else
        echo "=== Do Not Clone Smart-Mirror ===">>$INSTALL_LOG
    fi
  fi
else
  CLONE_MIRROR=true
fi
if $CLONE_MIRROR; then
  # Getting the code
  echo "=== Cloning Smart-Mirror ===">>$INSTALL_LOG
  whiptail --msgbox "${blu}Cloning smart-mirror Git Repo${end}" 20 80 --title "Installing Smart-Mirror Code"
  if git clone https://github.com/evancohen/smart-mirror.git >> $INSTALL_LOG; then
      whiptail --msgbox "${grn}smart-mirror code is now downloaded${end}\n" 20 80 --title "Installing Smart-Mirror Code" 
      echo "=== Cloning Smart-Mirror Successfull ===">>$INSTALL_LOG 
  else
      whiptail --msgbox "${red}Unable to clone smart-mirror :( ${end}\n" 20 80 --title "Installing Smart-Mirror Code"  
      echo "=== Cloning Smart-Mirror Failed ===">>$INSTALL_LOG
  fi
else
  if $PULL_MIRROR; then
    whiptail --msgbox "${red}Git Pull Failed!${end}" 20 80 --title "Installing Smart-Mirror Code"  
    echo "=== Pulling Smart-Mirror Failed ===">>$INSTALL_LOG
  else
    whiptail --msgbox "${grn}Git Pull was successfull!${end}" 20 80 --title "Installing Smart-Mirror Code"  
    echo "=== Pulling Smart-Mirror Successfull ===">>$INSTALL_LOG 
  fi
fi
}

function do_2_nodeInstall() {
NODE_INSTALL=false
if command_exists node; then
	NODE_CURRENT=$(node -v)
	printf "%sMinimum Node version: $NODE_MINIMUM_VERSION\n"
	printf "%sInstalled Node version: $NODE_CURRENT\n"
	if check_version $NODE_MINIMUM_VERSION $NODE_CURRENT; then
    	NODE_INSTALL=true
    	# If Node is already running then abort
    	if pgrep "node" > /dev/null; then
            if (whiptail --title "Error: Node currently Running" --yesno "Node is currently running. Would you like to close node?" 20 60 2) then
                killall -9 node
            else
                whiptail --title "Node Installation" --msgbox "Node Install Failed because Node was Running." 20 60 1
            fi
		fi
        whiptail --gauge "Looks like you need an upgrade. Taking care of that for you." 20 60 0
        NODE_INSTALL=true
	fi
else
	whiptail --gauge "No Node installation found. Installing it for you." 20 60 0
	NODE_INSTALL=true
fi
# Upgrade node if it is out of date
if $NODE_INSTALL; then
  echo "=== Node Install v$NODE_STABLE_VERSION ===">>$INSTALL_LOG
  # start sudo timer 5 Minutes 
  echo -e $sudoPass | sudo -S echo ""
  whiptail --gauge "Please wait while we are downloading NodeJS v$NODE_STABLE_VERSION..." 6 50 0
  curl -sL https://deb.nodesource.com/setup_$NODE_STABLE_VERSION | sudo -E bash - | whiptail --gauge "Please wait while we are downloading NodeJS v$NODE_STABLE_VERSION..." 6 50 50
  whiptail --gauge "Please wait while we are downloading NodeJS v$NODE_STABLE_VERSION..." 6 50 99
  sudo -v
  sudo debconf-apt-progress --logfile $INSTALL_LOG -- apt-get install -y nodejs
	whiptail --msgbox "Node installation complete." --title "Node Installation" 20 60 1
else
  echo "=== Node Install v$NODE_STABLE_VERSION ===">>$INSTALL_LOG
fi
}

function do_1_nativeDeps() {
echo -e $sudoPass | sudo -S debconf-apt-progress --logfile $INSTALL_LOG -- apt-get install -y curl wget git sox unclutter libatlas-base-dev
RET=$?
if [ $RET -eq 30 ]; then
    whiptail --msgbox "\
Failed to install Native Dependencies. 
Please refer to $INSTALL_LOG for more details.\
" 20 20 1
elif [ $RET -eq 0 ]; then
    whiptail --msgbox "Native Dependencies are installed successfully." 20 60 1
else
    whiptail --msgbox "Native Dependencies are installed successfully." 20 60 1
fi
}

function do_noobsCheck() {
if [ "$INTERACTIVE" = True ]; then
    whiptail --yesno "\
Installing RASPBIAN using NOOBS will not function properly. 

If you've installed RASPBIAN using NOOBS you'll need to refer 
to the docs to see the proper way to install RASPBIAN so that 
Smart-Mirror functions properly. 

Did you use NOOBS to install RASPBIAN?\
    " $DEFAULT 20 70 2
    RET=$?
  else
    RET=$1
  fi
  if [ $RET -eq 1 ] ; then
    echo === ERROR: YOU MUST NOT INSTALL RASPBIAN USING NOOBS! === >> $INSTALL_LOG
    whiptail --msgbox "\
Installation has failed. You MUST NOT install RASPBIAN using NOOBS!\

See https://docs.smart-mirror.io/docs/installing_raspbian.html for more info.
    " 20 70 1
    exit 1;
  else
    return $RET
  fi
}
function do_liteCheck() {
if [ "$INTERACTIVE" = True ]; then
    whiptail --yesno "\
Installing RASPBIAN LITE will not function properly. 

If you've installed RASPBIAN LITE you'll need to refer 
to the docs to see the proper way to install 
RASPBIAN W/ PIXEL so that Smart-Mirror functions properly. 

Did you install RASPBIAN LITE?\
    " $DEFAULT 20 70 2
    RET=$?
  else
    RET=$1
  fi
  if [ $RET -eq 1 ] ; then
    echo === ERROR: YOU MUST NOT INSTALL RASPBIAN LITE! === >> $INSTALL_LOG
    whiptail --msgbox "\
Installation has failed. You MUST NOT install RASPBIAN LITE!

See https://docs.smart-mirror.io/docs/installing_raspbian.html for more info.
\
    " 20 70 1
    exit 1;
  else
    return $RET
  fi
}
function do_splash() {

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
today=`date +%m-%d-%Y__%H:%M:%S`
cat <<EOF >> $HOME/sm-setup.log

****************************************************************
              Running Smart-Mirror Pi Installation             
                 $today               
****************************************************************
EOF
sleep 5
whiptail --msgbox "This script will install the smart-mirror and it's dependencies.\
Please do not exit this script until it is complete." 20 60 1
}


if [ "$INTERACTIVE" = True ]; then
  if [ "$(whoami)" == "root" ]; then
    whiptail --msgbox "Do not run this script with root permissions, try: ${0##*/}" 20 60 1
    exit 1
  fi
  ARCH=$(uname -m) 
  # Check processor archetecture.
  if [ "$ARCH" != "armv7l" ]; then
	whiptail --title "Unsupported device!" --msgbox "The Smart-Mirror Setup Script only works on the Pi 2 and 3" 20 60 1
	exit 1;
  fi
  calc_wt_size
  do_splash
  do_noobsCheck
  do_liteCheck
  do_getSudoPW
  do_1_nativeDeps
  do_2_nodeInstall
  do_3_cloneSmartMirror
  do_4_npmInstall
  do_5_configKiosk
  do_6_rotateScreen
fi
