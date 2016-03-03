var config = {
    // Lenguage for the mirror (currently not implemented)
    language : "en",
    layout: "main",
    dateFormat: {
        time: "hh:mm a",
        date: "EEEE, MMMM d yyyy",
    },

    greeting : ["Hi, sexy!"], // An array of greetings to randomly choose from
    //you can also use timebased greetings
    //greeting : {
    //    night: ["Bed?", "zZzzZz", "Time to sleep"],
    //    morning: ["Good Morning"],
    //    midday: ["Hey!", "Hello"],
    //    evening: ["Good evening"]
    //}, // An array of greetings to randomly choose from

    sleep_timer: {
            start: 23,
            end: 06,
    },//automatic "good night" mod
    // forcast.io
    forcast : {
        key : "", // Your forcast.io api key
        units : "auto", // See forcast.io documentation if you are getting the wrong units
        language: "en",// see https://developer.forecast.io/docs/v2 "lang="
    },
    // Philips Hue
    hue : {
        ip : "", // The IP address of your hue base
        uername : "", // The username used to control your hue
        group : "0", // The group you'd like the mirror to control (0 is all hue lights connected to your hub)
    },
    // Calendar (An array of iCals)
    calendar: {
      icals : [],
      maxResults: 9, // Number of calender events to display (Defaults is 9)
      maxDays: 365, // Number of days to display (Default is one year)
      dateFormat: "MMMM Do YYYY, h:mm:ss a",
    },
    // Giphy
    giphy: {
      key : "" // Your Gliphy API key
    },

    traffic: {
      key : "", // Bing Maps API Key
      mode : "Driving", // Possibilities: Driving / Transit / Walking
      origin : "", // Start of your trip. Human readable address.
      destination : "", // Destination of your trip. Human readable address.
      name : "work", // Name of your destination ex: "work"
      reload_interval : 5 // Number of minutes the information is refreshed
    }
}
