# Documentation for Motion Detection

### Configuration

If you do not have a `config.js` file please enter `cd ~/motion-detect && cp config.example.js config.js` to create the `config.js` file
If you already have a `config.js` file you must add the following code to the file:
```
    // Auto Timer with Motion Detection
    autotimermotion : {
        motionenable : true, // Enable or disable this functionality
	    pin : 26, //Default pirPin is GPIO pin 26.
	    debug : true // send debug info to dev console, if debug autosleep is 30 seconds
        autotimerenable : true, // Enable or disable autotimer functionality
	    autosleep: 40.0, // How long the screen will stay awake before going to sleep in minutes as float value (40 Mins)
        autowake: '07:00:00', // When to automatically wake the screen up (7:00AM)
        //'wake_cmd': '/opt/vc/bin/tvservice -p', // The binary and arguments used on your system to wake the screen (no longer used)
        //'sleep_cmd': '/opt/vc/bin/tvservice -o', // The binary and arguments used on your system to sleep the screen (no longer used)
    }, //don't forget comma after closing bracket if not the last set of variables
```

Variable | Usage | Data Type | Default Value if not included in config.js
---------|-------|-----------|--------------
motionenableenable | enable motion detection. disable if no motion detection is connected | boolean | false
pin | Identify GPIO input Pin connected to output pin of the PIR device or other device used to detect motion | int | 26
debug | enable debugging autosleep is 30 seconds if debugging is enabled | boolean | true
autotimerenable | enable or disable autotimer functionality if this is disabled screen will not auto-sleep or auto-wake| boolean |true 
autosleep | how long the screen will stay awake before going to sleep in minutes as a float value | float | 40.0
autowake | When to automatically wake the screen up. In format of 'HH:mm:ss' using military time | string | '07:00:00'

### PIR device used in testing

https://smile.amazon.com/gp/product/B00FDPO9B8/ref=oh_aui_search_detailpage?ie=UTF8&psc=1

### Basic Functionality

Using a python code to HIGH or LOW on GPIO pin listed in config.js as `pin` variable or default pin 26 if not listed, when motion is not detected for `screentimeout` in minutes the python code will turn of hdmi using `tvservice -o' command. when motion is once again detected the python code uses 2 commands `tvservice -p` followed by `fbset -depth 8 && fbset -depth 16 && xrefresh`; Which powers on the monitor and refreshes the desktop display. 

### Issues

A live chat to get help and discuss mirror related issues: https://gitter.im/evancohen/smart-mirror. Usually there are a few folks hanging around in the lobby, but if there arent you are probubly better off [filing an issue](https://github.com/evancohen/smart-mirror/issues/new). Please tag @justbill2020 on any motion detection issues. 
