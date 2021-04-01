#!/bin/bash
# Script to enable and disable the HDMI signal of the Raspberry PI

CMD="$1"
type=cec-utils

function on {
    case $type
    'tvservice')
        tvservice -p && sudo chvt 6 && sudo chvt 7
    ;;
    'dpms')
        DISPLAY=:0 xset dpms force on
    ;;
    'vcgencmd')
        /usr/bin/vcgencmd display_power 1
    ;;
    'cec-utils')
        echo 'on 0' | cec-client -s
    ;;
    esac
}

function off {
    case $type
    'tvservice')
        tvservice -o
    ;;
    'dpms')
        DISPLAY=:0 xset dpms force off
    ;;
    'vcgencmd')
        /usr/bin/vcgencmd display_power 0
    ;;
    'cec-utils')
        echo 'standby 0' | cec-client -s
    ;;
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