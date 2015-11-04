# Smart Mirror
This project is inspired by [HomeMirror](https://github.com/HannahMitt/HomeMirror) and Michael Teeuw's [Magic Mirror](http://michaelteeuw.nl/tagged/magicmirror). It uses [annyang](https://github.com/TalAter/annyang) for voice interactivity, integrates with Philips Hue, and is my own take on what a "smart mirror" can be.

### [See it in action (Video)](https://www.youtube.com/watch?v=PDIbhV8Nvq8)

### Why start from scratch?
Starting from scratch was less about other projects not being good enough and more about my own learning experience. While I did get a lot of inspiration from other projects I really wanted this to be my own!

### Take it for a spin:
Check it out: [https://evancohen.github.io/smart-mirror/](https://evancohen.github.io/smart-mirror/).
The version running on this link has limited functionality: No Hue or Weather since config.js is not included in the source of this project and contains service keys, which I will not be posting.

### Getting Started
#### Hardware Components
- Raspberry Pi 2
- USB Microphone (Or Webcam w/ microphone)
- Monitor (with the bezel removed)
- Mirror Pane (aka Observation Glass)
- Philips Hue

#### Installation
In order to get started I suggest a clean install of Raspbian. You can snag a fresh copy of Jessie (recommended, it's the future) or Wheezy from the [Raspbian Download Page](https://www.raspberrypi.org/downloads/raspbian/).

##### Getting Chromium
Once you get that up and running you'll need to download the latest version of Chromium. Unfortunately armhf binaries for Chromium are a little tricky to find, but Ubuntu has you covered. Thank you [Conor O'Neill](http://conoroneill.net/running-the-latest-chromium-45-on-debian-jessie-on-your-raspberry-pi-2/) for figuring this out! If you are running Wheezy you'll also need to update libc6 (Thank you [Robert Shenton](https://github.com/miltage/) for sharing this with me), instructions for that can be found here: [http://stackoverflow.com/questions/10863613/how-to-upgrade-glibc-from-version-2-13-to-2-15-on-debian](http://stackoverflow.com/questions/10863613/how-to-upgrade-glibc-from-version-2-13-to-2-15-on-debian)

Download and install Chromium by running the following (Just a heads up, it takes a while to download the chromium-browser package):

```
wget http://ftp.us.debian.org/debian/pool/main/libg/libgcrypt11/libgcrypt11_1.5.0-5+deb7u3_armhf.deb
wget http://launchpadlibrarian.net/218525709/chromium-browser_45.0.2454.85-0ubuntu0.14.04.1.1097_armhf.deb
wget http://launchpadlibrarian.net/218525711/chromium-codecs-ffmpeg-extra_45.0.2454.85-0ubuntu0.14.04.1.1097_armhf.deb
sudo dpkg -i libgcrypt11_1.5.0-5+deb7u3_armhf.deb
sudo dpkg -i chromium-codecs-ffmpeg-extra_45.0.2454.85-0ubuntu0.14.04.1.1097_armhf.deb
sudo dpkg -i chromium-browser_45.0.2454.85-0ubuntu0.14.04.1.1097_armhf.deb
```
##### Getting the code
Next up you'll want to clone this repository onto your Pi if you haven't already yet
```
git clone git@github.com:evancohen/smart-mirror.git
```

##### Setting up the configuration
Done? Excellent, let's continue.

Time to update the config file (apologies to those who tried to use this repository before I had the chance to add it). You'll need to fill in two things:
1. A [Forecast API key](https://developer.forecast.io/) (don't worry, it's free)
2. Philips Hue Bridge IP address with a configured user. Details about how to set this up in the [Philips Hue Developer Documentation](http://www.developers.meethue.com/documentation/getting-started)

##### Test it out
Now, before we start going crazy and installing certificates let's check that everything loads in correctly. You can run a lightweight Python server in the smart-mirror directory to test things out:
```
python -m SimpleHTTPServer 8000
```

Go to `http://localhost:8000` and Chromium should prompt you to allow access to both your microphone and location. Try saying "What can I say". 

##### Troubleshooting your microphone in Chromium
If the page is not responding to you, double check that Chrome is using the correct input device by clicking the video camera icon (next to the favorite icon on the URL bar)

If you are still having trouble with your microphone I suggest you test it out by following the instructions at [DIY Hacking](http://diyhacking.com/best-voice-recognition-software-for-raspberry-pi/)

##### Installing a certificate
You may have noticed that Chromium continuously prompts for microphone access. This is the only drawback of annyang, but there is a simple work around. If you serve your site using HTTPS it will only ever ask you once. In order to serve your site locally over HTTPS you'll first need to generate your own certfile with
```
openssl req -new -x509 -keyout python.pem -out python.pem -days 365 -nodes
```
Then crack open SimpleSecureHTTPServer.py and replace *PATH_TO_CERT* with the path to your cert file.

Now the local HTTPS server can be run with
```
python SimpleSecureHTTPServer.py
```
You can now view the smart mirror at `https://localhost:4443`. Chrome will warn you that the connection is not secure, which is to be expected because you just signed your own certificate. Just go to 'Advanced' and click 'Proceed to localhost (unsafe)'.

##### Caveats
The HUE won't work over HTTPS. It's lame, I know, I'm looking for a work-around. 

The weather service breaks CORS, so you'll need to either install the [Allow-Control-Allow-Origin: *](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?utm_source=chrome-app-launcher-info-dialog) Chrome extension (recommended) or set up a [Proxy](https://github.com/iantearle/forecast.io-javascript-api).


### License:
MIT

### More info:
Favicon from [In the Wake of the King](http://walkingmind.evilhat.com/2014/03/17/in-the-wake-of-the-king/), a head nod to **The Watcher** – "A byblow of the king and a queen of the sea, she has remained apart from the workings of her family, more home beneath the waves, watching all through water and mirror. Her ambitions lie outside the Eternal Kingdom, but her secrets are valuable everywhere."

Awesome.
