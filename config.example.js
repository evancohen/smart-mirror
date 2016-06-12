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
    geo_position: {
       latitude: 78.23423423,
       longitude: 13.123124142
    },
    */
    
    // forcast.io
    forecast : {
        key : "", // Your forcast.io api key
        units : "auto" // See forcast.io documentation if you are getting the wrong units
    },
    // Philips Hue
    hue : {
        ip : "", // The IP address of your hue base
        uername : "", // The username used to control your hue
        groups : [{
            id : 0, // The group id 0 will change all the lights on the network
            name : "all"
        }, {
            id : 1,
            name : "bedroom"
        }, {
            id : 2,
            name : "kitchen"
        }]
    },
    // Calendar (An array of iCals)
    calendar: {
      icals : [], // Be sure to wrap your URLs in quotes
      maxResults: 9, // Number of calender events to display (Defaults is 9)
      maxDays: 365 // Number of days to display (Default is one year)
    },
    // Giphy
    giphy: {
      key : "" // Your Gliphy API key
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

      reload_interval : 5, // Number of minutes the information is refreshed
      // An array of tips that you would like to display travel time for
      trips : [{
        mode : "Driving", // Possibilities: Driving / Transit / Walking
        origin : "", // Start of your trip. Human readable address.
        destination : "", // Destination of your trip. Human readable address.
        name : "work", // Name of your destination ex: "work"
        /*startTime: "",
        endTime: ""*/ // Optional starttime and endtime when the traffic information should be displayed on screen. The format can be either hh:mm or hh:mm am/pm
      }]
    },
    rss: {
      feeds : [],  // RSS feeds list - e.g. ["rss1.com", "rss2.com"]
      refreshInterval : 120 // Number of minutes the information is refreshed
    }
};

// DO NOT REMOVE
if (typeof module !== 'undefined') {module.exports = config;}
