var config = {

    // Lenguage for the mirror
    language : "en", //must also manually update locales/X.js bower component in index.html
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
    forcast : {
        key : "", // Your forcast.io api key
        units : "auto" // See forcast.io documentation if you are getting the wrong units
    },
    // lights
    light : {
        settings : {
            hue_ip : "", // The IP address of your hue base
            hue_username : "" // The username used to control your hue
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
      maxDays: 365 // Number of days to display (Default is one year)
    },
    // Giphy
    giphy: {
      key : "" // Your Gliphy API key
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
    }
};
