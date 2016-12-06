#!/bin/bash
# Script to enable and disable the HDMI signal of the Raspberry PI

CMD="$1"

function on {
    /opt/vc/bin/tvservice --preferred

    # Hack to enable virtual terminal nr 7 again:
    chvt 6
    chvt 7
}

function off {
    /opt/vc/bin/tvservice --off
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