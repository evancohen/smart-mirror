#!/bin/bash

#set -e

# Supported versions of node: v4.x, v5.x, v6.x, v7.x, 8.x, 10.x
NODE_MINIMUM_VERSION="v10.0.0"
NODE_STABLE_VERSION="10.x"
NPM_TESTED="V6.0.0"
PM2_FILE=pm2_smart_mirror.json


# Ensure we are using sudo
if [ "$(whoami)" == "root" ];
then
	echo "Do not run this script with root permissions, try: ./${0##*/} "
	exit 0
fi
ARCH=$(uname -m)
mac=$(uname -s)
if [ $mac == 'Darwin' ]; then
  echo this is a mac | tee -a $logfile
	cmd=greadlink
else
	cmd=readlink
fi
# put the log where the script is located
logdir=$(dirname $($cmd -f "$0"))
# if the script was execute from the web
if [[ $logdir != *"smart-mirror/scripts"* ]]; then
	# use the smart-mirror/scripts folder, if setup
	if [ -d smart-mirror ]; then
		cd ~/smart-mirror/scripts >/dev/null
			logdir=$(pwd)
		cd - >/dev/null
	else
	  # use the users home folder if initial install
	  logdir=$HOME
	fi
fi
logfile=$logdir/pm2_setup.log
echo pm2  log being saved to $logfile

# Determine which Pi is running.
date +"pm2 install starting  - %a %b %e %H:%M:%S %Z %Y" >>$logfile


 #Use pm2 control like a service smart-mirror

	  cd ~/smart-mirror
      echo install and setup pm2 | tee -a $logfile
			if [ ! -f scripts/pm2_smart_mirror.json ]; then
			echo -e '{
			  "apps" : [{
			    "name"        : "Smart Mirror",
			    "script"      : "/home/pi/smart-mirror/scripts/bash-start.sh",
			    "watch"       : ["/home/pi/smart-mirror/config.json"]
			  }]
			}' >scripts/pm2_smart_mirror.json
			echo add usepm2 parm to npm start in bash-start.sh >> $logfile
		    sed -i 's/npm start/npm start usepm2/' scripts/bash-start.sh
			fi
 			# assume pm2 will be found on the path
			pm2cmd=pm2
			# check to see if already installed
			pm2_installed=$(which $pm2cmd)
			up=
			if [ $mac == 'Darwin' ]; then
				 up="--unsafe-perm"
				 launchctl=launchctl
				 launchctl_path=$(which $launchctl)
				 `export PATH=$PATH:${launchctl_path%/$launchctl}`
			fi
			# check to see if already installed
			pm2_installed=$(which $pm2cmd)
			if [  "$pm2_installed." != "." ]; then
			    # does it work?
					pm2_fails=$(pm2 list | grep -i -m 1 "App Name" | wc -l )
					if [ $pm2_fails != 1 ]; then
					   # uninstall it
						 echo pm2 installed, but does not work, uninstalling >> $logfile
					   sudo npm uninstall $up -g pm2 >> $logfile
						 # force reinstall
				     pm2_installed=
					fi
			fi
			# if not installed
			if [  "$pm2_installed." == "." ]; then
				# install it.
				echo pm2 not installed, installing >>$logfile
				result=$(sudo npm install $up -g pm2 )
				echo pm2 install result $result >>$logfile
				# if this is a mac
				if [ $mac == 'Darwin' ]; then
					echo this is a mac, fixup for path >>$logfile
					# get the location of pm2 install
					# parse the npm install output to get the command
					pm2cmd=`echo $result | awk -F -  '{print $1}' | tr -d '[:space:]'`
					c='/pm2'
					# get the path only
					echo ${pm2cmd%$c} >scripts/pm2path
				fi
			fi
			echo get the pm2 platform specific startup command >>$logfile
			# get the platform specific pm2 startup command
			v=$($pm2cmd startup | tail -n 1)
			if [ $mac != 'Darwin' ]; then
				# check to see if we can get the OS package name (Ubuntu)
				if [ $(which lsb_release| wc -l) >0 ]; then
					# fix command
					# if ubuntu 18.04, pm2 startup gets something wrong
					if [ $(lsb_release  -r | grep -m1 18.04 | wc -l) > 0 ]; then
						 v=$(echo $v | sed 's/\/bin/\/bin:\/bin/')
					fi
				fi
			fi
			echo startup command = $v >>$logfile
			# execute the command returned
		  $v 2>&1 >>$logfile
			echo pm2 startup command done >>$logfile
			# is this is mac
			# need to fix pm2 startup, only on catalina
			if [ $mac == 'Darwin' -a $(sw_vers -productVersion | head -c 6) == '10.15.' ]; then
			  # only do if the faulty tag is present (pm2 may fix this, before the script is fixed)
				if [ $(grep -m 1 UserName /Users/$USER/Library/LaunchAgents/pm2.$USER.plist | wc -l) -eq 1 ]; then
					# copy the pm2 startup file config
					cp  /Users/$USER/Library/LaunchAgents/pm2.$USER.plist .
					# edit out the UserName key/value strings
					sed -e '/UserName/{N;d;}' pm2.$USER.plist > pm2.$USER.plist.new
					# copy the file back
					sudo cp pm2.$USER.plist.new /Users/$USER/Library/LaunchAgents/pm2.$USER.plist
				fi
			fi

		# if the user is no pi, we have to fixup the pm2 json file
		echo configure the pm2 config file for smart mirror >>$logfile
		if [ "$USER"  != "pi" ]; then
			echo the user is not pi >>$logfile
			# go to the scripts folder
			cd scripts
			# edit the startup script for the right user
			echo change bash-start.sh >>$logfile
			 if [ ! -e bash-start_temp.sh ]; then
			   echo save copy of bash-start.sh >> $logfile
			   cp bash-start.sh bash-start_temp.sh
			 fi
			 if [ $(grep pi bash-start_temp.sh | wc -l) -gt 0 ]; then
			  echo change hard coded pi username  >> $logfile
				sed 's/pi/'$USER'/g' bash-start_temp.sh >bash-start.sh
			 else
			  if [ $HOME != 'home' ]; then
					echo change relative home path to hard coded path >> $logfile
					sed 's/home/$HOME/g' bash-start_temp.sh >bash-start.sh
				fi
			 fi
			# edit the pms config file for the right user
			echo change $PM2_FILE >>$logfile
			sed 's/pi/'$USER'/g' $PM2_FILE > pm2_smart_mirror_new.json
			# make sure to use the updated file
			PM2_FILE=pm2_smart_mirror_new.json
			# if this is a mac
			if [ $mac == 'Darwin' ]; then
				 # copy the path file to the system paths list
				 sudo cp ./pm2path /etc/paths.d
				 # change the name of the home path for mac
				 sed 's/home/Users/g' $PM2_FILE > pm2_smart_mirror_new1.json
				 # make sure to use the updated file
				 PM2_FILE=pm2_smart_mirror_new1.json
			fi
			echo now using this config file $PM2_FILE >>$logfile
			# go back one cd level
			cd - >/dev/null
		fi
		echo start smart mirror via pm2 now >>$logfile
		# tell pm2 to start the app defined in the config file
		$pm2cmd start $HOME/smart-mirror/scripts/$PM2_FILE
		# tell pm2 to save that configuration, for start at boot
		echo save smart mirror pm2 config now  >>$logfile
		$pm2cmd save
		pm2setup=$true
echo pm2 setup completed | tee -a $logfile
date +"pm2 install ended  - %a %b %e %H:%M:%S %Z %Y" >>$logfile
