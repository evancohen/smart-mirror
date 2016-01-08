# Smart Mirror
This project is inspired by [HomeMirror](https://github.com/HannahMitt/HomeMirror) and Michael Teeuw's [Magic Mirror](http://michaelteeuw.nl/tagged/magicmirror) and evancohens [SmartMirror](https://github.com/evancohen/smart-mirror) . It uses [annyang](https://github.com/TalAter/annyang) for voice interactivity, [electron](http://electron.atom.io/) to make it cross platform, and integrates with Philips Hue and can also display RSS feeds and iCal for your convenience.

There is a gitpage here also - http://blackshroud.github.io/smart-mirror/

### Getting Started
#### Hardware Components
- Raspberry Pi 2
- USB Microphone (Or Webcam w/ microphone)
- Monitor (with the bezel removed)
- Mirror Pane (aka Observation Glass)
- Philips Hue

#### Installation

I have set this up so that it can run of of any web server, so as long as you have a webserver running somewhere, that you can host this from, you should be fine. (keeping in mind that you MUST use Chrome to display it)

##### Setting up the configuration
Done? Excellent, let's continue.

Time to update the config file... You'll need to fill things in `js/config.js`:

1. A [Forecast API key](https://developer.forecast.io/) (don't worry it's free)
2. Philips Hue Bridge IP address with a configured user. Details about how to set this up in the [Philips Hue Developer Documentation](http://www.developers.meethue.com/documentation/getting-started)
4. Set RSS feed location in config.js
5. Add iCal URL to config.js

The format of your config should look something like this:
```
var FORCAST_API_KEY = "a6s5dg39j78qj38sjs91je9djadfa1e";
var HUE_BASE = "http://192.168.1.99/api/as9234ho0dfhoq01f2as3yh4m0/";
```

##### Install dependencies and run
Before we can run the thing we've got to install the projects dependencies. From the root of the `smart-mirror` directory run:
```
npm install
```

This will take a minute, it has to download [electron-prebuild](https://github.com/mafintosh/electron-prebuilt). Once that is done you can launch the mirror with
```
npm start
```

#### Disabling the debug console
If you don't want the debug console to open up every time you launch the mirror you'll want to comment this line out from `main.js`:
``` javascript
mainWindow.webContents.openDevTools();
```
You should also set the default map home in map-service.js (line 6)


### License:
MIT
