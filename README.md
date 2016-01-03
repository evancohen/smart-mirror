# Smart Mirror
This project is inspired by [HomeMirror](https://github.com/HannahMitt/HomeMirror) and Michael Teeuw's [Magic Mirror](http://michaelteeuw.nl/tagged/magicmirror) and evancohens [SmartMirror](https://github.com/evancohen/smart-mirror) . It uses [annyang](https://github.com/TalAter/annyang) for voice interactivity, [electron](http://electron.atom.io/) to make it cross platform, and integrates with Philips Hue and can also display RSS feeds.

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

Time to update the config file... You'll need to fill in two things into `js/config.js`:

1. A [Forecast API key](https://developer.forecast.io/) (don't worry, it's free)
2. Philips Hue Bridge IP address with a configured user. Details about how to set this up in the [Philips Hue Developer Documentation](http://www.developers.meethue.com/documentation/getting-started)
3. Set default map home in map-service.js (line 6)
4. Set RSS feed location in config.js
5. Add iCal URL to config.js

### License:
MIT

