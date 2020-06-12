#!/bin/bash
 chromium-browser -noerrdialogs -kiosk -start_maximized  --disable-infobars --app=$1  --ignore-certificate-errors-spki-list --ignore-ssl-errors --ignore-certificate-errors 2>/dev/null