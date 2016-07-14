var config = {

    // Lenguage for the mirror
    language : "en-US",
    
    // motion Detection
    motion : {
        Pin : 26, //Default pirPin is GPIO pin 26.
        ScreenTimeOut : 0.5, //Default timeout (in minutes) is 5.0 minutes. This must be a float number.
        Enable : true, // Enable or disable this functionality
        Debug : true // send debug info to dev console, if debug timeout is 30 seconds (not yet working)		
    },
    // Keyword Spotting (Hotword Detection)
    speech : {
        keyword : "Smart Mirror",
        model : "smart_mirror.pmdl", // The name of your model
        sensitivity : 0.75, // Keyword getting too many false positives or not detecting? Change this.
        continuous: false // After a keyword is detected keep listening until speech is not heard
    },
    layout: "main",
    

    // Alternativly you can have greetings that appear based on the time of day
    
    greeting : {
       night: ["Bed?", "zZzzZz", "Time to sleep"],
       morning: ["Good Morning"],
       midday: ["Hey!", "Hello"],
       evening: ["Good evening"]
    },
    

    //use this only if you want to hardcode your geoposition (used for weather)
    /*
    geo_position: {
       latitude: 78.23423423,
       longitude: 13.123124142
    },
    */
    
    // forcast.io
    forecast : {
        key : "30f4ff4dd45f4364eb8d5fb73c5401d6", // Your forcast.io api key
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
      icals : ["https://calendar.google.com/calendar/ical/t61t5rc5p7gqq8j90s81gg8fek%40group.calendar.google.com/private-e410059cae1c82d48b2a50029c09aaea/basic.ics"], // Be sure to wrap your URLs in quotes
      maxResults: 9, // Number of calender events to display (Defaults is 9)
      maxDays: 365 // Number of days to display (Default is one year)
    },
    // Giphy
    giphy: {
      key : "dc6zaTOxFJmzC" // Your Gliphy API key
    },
    // YouTube
    youtube: {
      key : "AIzaSyDViX-1tRo0gMI1vxMs2PbX6IZ1-22shx8" // Your YouTube API key
    },
    // SoundCloud
    soundcloud: {
        key : "df9089aed534d0a023bcd92163cc19bd" // Your SoundCloud API key
    },
    traffic: {
      key : "AnsC-GK0VRN780HMmqOnBX83HtgpRgi-TMcoCKye0oMS_IiADw0f3lFMuIlGZiIS", // Bing Maps API Key

      reload_interval : 5, // Number of minutes the information is refreshed
      // An array of trips that you would like to display travel time for
      trips : [{
        mode : "Driving", // Possibilities: Driving / Transit / Walking
        origin : "4650 188th St, 60478", // Start of your trip. Human readable address.
        destination : "300 W Adams, Chicago, IL", // Destination of your trip. Human readable address.
        name : "Premier", // Name of your destination ex: "work"
        startTime: "07:00",
        endTime: "11:00" // Optional starttime and endtime when the traffic information should be displayed on screen. The format can be either hh:mm or hh:mm am/pm
      },
	  {
        mode : "Driving", // Possibilities: Driving / Transit / Walking
        origin : "4650 188th St, 60478", // Start of your trip. Human readable address.
        destination : "38 Plaza Dr, 60559", // Destination of your trip. Human readable address.
        name : "Stadtler", // Name of your destination ex: "work"
        startTime: "07:00",
        endTime: "11:00" // Optional starttime and endtime when the traffic information should be displayed on screen. The format can be either hh:mm or hh:mm am/pm
      },
	  {
        mode : "Driving", // Possibilities: Driving / Transit / Walking
        origin : "4650 188th St, 60478", // Start of your trip. Human readable address.
        destination : "1 bloomingdale Place, 60108", // Destination of your trip. Human readable address.
        name : "Grandma Candy", // Name of your destination ex: "work"
        /*startTime: "",
        endTime: ""*/ // Optional starttime and endtime when the traffic information should be displayed on screen. The format can be either hh:mm or hh:mm am/pm
      },
	  {
        mode : "Driving", // Possibilities: Driving / Transit / Walking
        origin : "4650 188th St, 60478", // Start of your trip. Human readable address.
        destination : "10330 Mayfield Ave, 60453", // Destination of your trip. Human readable address.
        name : "Grandma and Grandpa's", // Name of your destination ex: "work"
        /*startTime: "",
        endTime: ""*/ // Optional starttime and endtime when the traffic information should be displayed on screen. The format can be either hh:mm or hh:mm am/pm
      },
	  {
        mode : "Driving", // Possibilities: Driving / Transit / Walking
        origin : "4650 188th St, 60478", // Start of your trip. Human readable address.
        destination : "11100 Orland Pkwy, 60467", // Destination of your trip. Human readable address.
        name : "Church", // Name of your destination ex: "work"
        startTime: "13:00",
        endTime: "15:00" // Optional starttime and endtime when the traffic information should be displayed on screen. The format can be either hh:mm or hh:mm am/pm
      },
	  {
        mode : "Driving", // Possibilities: Driving / Transit / Walking
        origin : "4650 188th St, 60478", // Start of your trip. Human readable address.
        destination : "11100 Orland Pkwy, 60467", // Destination of your trip. Human readable address.
        name : "Church", // Name of your destination ex: "work"
        startTime: "06:00",
        endTime: "10:00" // Optional starttime and endtime when the traffic information should be displayed on screen. The format can be either hh:mm or hh:mm am/pm
      }]
    },
    rss: {
      feeds : [],  // RSS feeds list - e.g. ["rss1.com", "rss2.com"]
      refreshInterval : 120 // Number of minutes the information is refreshed
    }
};

// DO NOT REMOVE
if (typeof module !== 'undefined') {module.exports = config;}
