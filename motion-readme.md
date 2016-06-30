# Documentation for Motion Detection

### Configuration

Variable | Usage | Data Type | Default Value if not included in config.js
---------|-------|-----------|--------------
pin | Identify GPIO input Pin connected to output pin of the PIR device or other device used to detect motion | int | 26
screentimeout | Amount of time in minutes before HDMI is turned off after last detected motion | float | 5.0
enable | enable motion detection | boolean | false
debug | enable debugging (currently not implemented) | boolean | true

### PIR device used in testing

https://smile.amazon.com/gp/product/B00FDPO9B8/ref=oh_aui_search_detailpage?ie=UTF8&psc=1

### Basic Functionality

Using a python code to HIGH or LOW on GPIO pin listed in config.js as `pin` variable or default pin 26 if not listed, when motion is not detected for `screentimeout` in minutes the python code will turn of hdmi using `tvservice -o' command. when motion is once again detected the python code uses 2 commands `tvservice -p` followed by `fbset -depth 8 && fbset -depth 16 && xrefresh`; Which powers on the monitor and refreshes the desktop display. 

### Issues

A live chat to get help and discuss mirror related issues: https://gitter.im/evancohen/smart-mirror. Usually there are a few folks hanging around in the lobby, but if there arent you are probubly better off [filing an issue](https://github.com/evancohen/smart-mirror/issues/new). Please tag @justbill2020 on any motion detection issues. 
