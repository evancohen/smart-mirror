# Smart Mirror

[![Join the chat at https://gitter.im/evancohen/smart-mirror](https://badges.gitter.im/evancohen/smart-mirror.svg)](https://gitter.im/evancohen/smart-mirror?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This project was inspired by [HomeMirror](https://github.com/HannahMitt/HomeMirror) and Michael Teeuw's [Magic Mirror](http://michaelteeuw.nl/tagged/magicmirror). It uses [annyang](https://github.com/TalAter/annyang) for voice interactivity, [electron](http://electron.atom.io/) to make it cross platform, and integrates with Philips Hue. It is my own take on what a "smart mirror" can be.

[See it in action (Video)](https://www.youtube.com/watch?v=PDIbhV8Nvq8)

#### Why start from scratch?
Starting from scratch was less about other projects not being good enough and more about my own learning experience. While I did get a lot of inspiration from other projects I really wanted to see how much further I could take things.

#### Gitter:
A live chat to get help and discuss mirror related issues: https://gitter.im/evancohen/smart-mirror. Usually there are a few folks hanging around in the lobby, but if there arent you are probubly better off [filing an issue](https://github.com/evancohen/smart-mirror/issues/new).

### Getting Started
#### Hardware Components
- Raspberry Pi 2**
- USB Microphone (Or Webcam w/ microphone)
- Monitor (with the bezel removed)
- Mirror Pane (aka Observation Glass)
- Philips Hue

** Also compatible with other Linux, Windows, and OSX devices. See the `cordova` branch for Android and iOS compatibility.

#### Installation
In order to get started I suggest a clean install of Raspbian. You can snag a fresh copy of Jessie (recommended, it's the future) or Wheezy from the [Raspbian Download Page](https://www.raspberrypi.org/downloads/raspbian/).

You'll also need to install Node (v4.0.0+) which now comes bundled with npm.
```
wget https://nodejs.org/dist/v4.0.0/node-v4.0.0-linux-armv7l.tar.gz 
tar -xvf node-v4.0.0-linux-armv7l.tar.gz 
cd node-v4.0.0-linux-armv7l
```
Copy to /usr/local
```
sudo cp -R * /usr/local/
```

##### Getting the code
Next up you'll want to clone this repository into your user's home folder on your Pi:
```
cd ~
git clone https://github.com/evancohen/smart-mirror.git
```

##### Configuring the mirror
You'll need to create a `config.js` file, a template for this can be found at config.example.js. Simply copy the template and save it as `config.js`
``` bash
cp config.example.js config.js
```

Then fill out the config file, which should end up looking something like this:
``` javascript
var config = {
    language : "en", 
    layout: "main",
    greeting : ["Hi, sexy!", "Hey There!", "Looking Awesome!"], 
    forcast : {
        key : "a6s5dg39j78qj38sjs91je9djadfa1e", 
        units : "auto" 
    },
    hue : {
        ip : "192.168.1.99", 
        uername : "as9234ho0dfhoq01f2as3yh4m0", 
        group : "0" 
    },
    calendar: {
      icals : ["https://calendar.google.com/calendar/ical/SOMESTUFF/basic.ics",
"https://outlook.office365.com/owa/calendar/SOMESTUFF/reachcalendar.ics"],
      maxResults: 9, 
      maxDays: 365 
    },
    giphy: {
      key : "a6s5dg39j78qj38sjs91je9djadfa1e" 
    },
    traffic: {
      key : "a6s5dg39j78qj38sjs91je9djadfa1e",
      mode : "Driving",
      origin : "350 5th Ave, New York, NY 10118",
      destination : "1 Dr Carlton B Goodlett Pl, San Francisco, CA 94102",
      name : "work",
      reload_interval : 5
    }
};
```
Note that if you start the mirror and get a black screen you most likeley have an issue with your config.

##### Configuring the Pi
In order to rotate your monitor you'll need to add the following line to `/boot/config.txt`
```
display_rotate=1
```
You can also set this value to '3' to have a flipped vertical orientation.

In order to disable the screensaver you'll want to comment out (with a '#') the `@xscreensaver` and `@lxpanel` lines in `/etc/xdg/lxsession/LXDE/autostart`. You'll also want to add the following lines to that same file
```
@xset s off
@xset -dpms
@xset s noblank
```

Optionally, you can configure your Pi to start the mirror on boot
In **/home/pi/**, create the file called smart-start.sh with the following content:
```
#!/bin/bash
export DISPLAY=:0
export XAUTHORITY=/home/pi/.Xauthority
cd /home/pi/smart-mirror && npm start
```

Make the file owned by the user pi
`chown pi:pi /home/pi/smart-start.sh`
And make it executable
`chmod +x /home/pi/smart-start.sh`
Then, edit the file **/home/pi/.config/lxsession/LXDE-pi/autostart**
and add the following line to the end:
/`home/pi/smart-start.sh &`
Reboot the Pi and you should be good to go

##### Install dependencies and run
Before we can run the thing we've got to install the projects dependencies. From the root of the `smart-mirror` directory run:
```
npm install
```

This will take a minute, it has to download [electron-prebuilt](https://github.com/mafintosh/electron-prebuilt). Once that is done you can launch the mirror with
```
npm start
```

#### Development and Contributing
See the `dev` branch for features that are curently in development.
If you would like to contribue please follow the [contribution guidelines](https://github.com/evancohen/smart-mirror/blob/master/CONTRIBUTING.md).
To launch the mirror with a debug window attached use the following command:
```
npm start dev
```
More info coming soon(ish). In the meantime head over to the [gitter chat](https://gitter.im/evancohen/smart-mirror) for help. 

#### Troubleshooting
If you are having trouble getting a USB microphone to work on your Pi try following [these steps](https://github.com/evancohen/smart-mirror/issues/20)

#### For full localization you need to change some values in the index.html. 
Look for the line:  <span class="time-to">Time to {{traffic.destination}}:</span> and change to
"<span class="time-to">in your language {{traffic.destination}}:</span>
Furthermore change  <h2>Available Commands</h2> into  <h2>in your language</h2>

### License
MIT

### Author
[Evan Cohen](http://evanbtcohen.com/)

### More info
Favicon from [In the Wake of the King](http://walkingmind.evilhat.com/2014/03/17/in-the-wake-of-the-king/), a head nod to **The Watcher** – "A byblow of the king and a queen of the sea, she has remained apart from the workings of her family, more home beneath the waves, watching all through water and mirror. Her ambitions lie outside the Eternal Kingdom, but her secrets are valuable everywhere."

Awesome.
