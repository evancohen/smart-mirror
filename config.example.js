var config = {

    // Lenguage for the mirror
    language : "en-US",
    
    // Keyword Spotting (Hotword Detection)
    speech : {
        keyword : "Smart Mirror",
        model : "smart_mirror.pmdl", // The name of your model
        sensitivity : 0.5, // Keyword getting too many false positives or not detecting? Change this.
        continuous: false // After a keyword is detected keep listening until speech is not heard
    },
    layout: "main",
    greeting : ["Hi, sexy!", "Greetings, commander"], // An array of greetings to randomly choose from

    // Alternativly you can have greetings that appear based on the time of day
    /*
    greeting : {
       night: ["Bed?", "zZzzZz", "Time to sleep"],
       morning: ["Good Morning"],
       midday: ["Hey!", "Hello"],
       evening: ["Good evening"]
    },
    */

    //use this only if you want to hardcode your geoposition (used for weather)
    /*
    geoPosition: {
       latitude: 78.23423423,
       longitude: 13.123124142
    },
    */

    // forecast.io
    forecast : {
        key : "", // Your forecast.io api key
        units : "auto", // See forecast.io documentation if you are getting the wrong units
        refreshInterval : 2, // Number of minutes the information is refreshed. Forecast.io limits requests to 1000/day: a 2min interval = 720 calls/day
    },
    // lights
    light : {
        settings : {
            hueIp : "", // The IP address of your hue base
            hueUsername : "" // The username used to control your hue
        },
        setup : [
            {
                name : "parlor", // Single word room name for speech recognition
                targets : [
                    {
                        type : "hyperion",
                        ip : "", // The IP address of your hyperion
                        port : "19444" // The port of your hyperion
                    },
                    {
                        type : "hue", // Philips Hue
                        id : 1 // The group id (0 will change all the lights on the network)
                    }
                ]
            },
            {
                name : "bath",
                targets : [
                    {
                        type : "hue",
                        id : 2
                    }
                ]
            }
        ]
    },
    // Calendar (An array of iCals)
    calendar: {
      icals : [], // Be sure to wrap your URLs in quotes
      maxResults: 9, // Number of calender events to display (Defaults is 9)
      maxDays: 365, // Number of days to display (Default is one year)
      showCalendarNames: false // Show calendar names above events
    },
    // Giphy
    giphy: {
      key : "dc6zaTOxFJmzC" // Your Gliphy API key
    },
    // YouTube
    youtube: {
      key : "" // Your YouTube API key
    },
    // SoundCloud
    soundcloud: {
        key : "" // Your SoundCloud API key
    },
    traffic: {
      key : "", // Bing Maps API Key
      refreshInterval : 5, // Number of minutes the information is refreshed
      // An array of tips that you would like to display travel time for
      trips : [{
        mode : "Driving", // Possibilities: Driving / Transit / Walking
        origin : "", // Start of your trip. Human readable address.
        via : "",  // [Optional] Set an intermediate goal for getting an alternate route for example
        destination : "", // Destination of your trip. Human readable address.
        name : "work", // Name of your destination ex: "work"
        /*startTime: "",
        endTime: ""*/ // Optional starttime and endtime when the traffic information should be displayed on screen. The format can be either hh:mm or hh:mm am/pm
      }]
    },
    rss: {
      feeds : [],  // RSS feeds list - e.g. ["rss1.com", "rss2.com"]
      refreshInterval : 120 // Number of minutes the information is refreshed
    },
    stock: {
      names: [] // The names of the stock quotes you with to show in the official format. (e.g.: 'YHOO','AAPL','GOOG')
    },
    autoTimer: {
      autoSleep: 2400000, // How long the screen will stay awake before going to sleep (40 Mins)
      autoWake: '07:00:00', // When to automatically wake the screen up (7:00AM)
      'wake_cmd': '/opt/vc/bin/tvservice -p', // The binary and arguments used on your system to wake the screen
      'sleep_cmd': '/opt/vc/bin/tvservice -o', // The binary and arguments used on your system to sleep the screen
    },
    lastfm: {
      key: "", // Your last.fm api key
      user: "", // Your last.fm username
      refreshInterval : 0.6 // Number of minutes between checks for playing track
    }
};

// DO NOT REMOVE
if (typeof module !== 'undefined') {module.exports = config;}
