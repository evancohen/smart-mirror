#!/bin/bash
# Script to enable and disable the HDMI signal of the Raspberry PI
CMD="$1"
CMD=${CMD,,}
type=vcgencmd

function on {
    case $type in
    "tvservice")
        (tvservice -p && sudo chvt 6 && sudo chvt 7) >/dev/null
    ;;
    "dpms")
	# this one doesn't work
	export DISPLAY=:0
	export LOGIN_USER="$2"
	su - $LOGIN_USER
	sudo xhost local:$LOGIN_USER &>/dev/null
        xset dpms force on >/dev/null
	exit
    ;;
    "vcgencmd")
        (/usr/bin/vcgencmd display_power 1) >/dev/null
    ;;
    "cec-utils")
        (echo 'on 0' | cec-client -s) >/dev/null
    ;;
    esac
}

function off {
    case $type in
    "tvservice")
        (tvservice -o) >/dev/null
    ;;
    "dpms")
        export DISPLAY=:0
        export LOGIN_USER="$2"
        su - $LOGIN_USER
        sudo xhost local:$LOGIN_USER &>/dev/null
        xset dpms force off >/dev/null
        exit        
    ;;
    "vcgencmd")
        (/usr/bin/vcgencmd display_power 0) >/dev/null
    ;;
    "cec-utils")
        (echo 'standby 0' | cec-client -s) >/dev/null
    ;;
    esac
}


function must_be_root {
    if [ $USER != root ]; then
        echo "ERROR: Script must be executed as the root user"
        exit 1
    fi
}

function main {
    must_be_root
    if [ "$CMD" == "on" ]; then
        on
    elif [ "$CMD" == "off" ]; then
        off
    else
        echo "Usage: $0 <on|off>"
        exit 1
    fi
    exit 0
}

main
