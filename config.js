var config = {
    // Lenguage for the mirror (currently not implemented)
    lenguage : "en",
    greeting : ["Hi, sexy!"], // An array of greetings to randomly choose from
    // forcast.io
    forcast : {
        key : "", // Your forcast.io api key
        units : "auto" // See forcast.io documentation if you are getting the wrong units
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
      maxDays: 365 // Number of days to display (Default is one year)
    },
    // Giphy
    giphy: {
      key : "" // Your Giphy API key
    },
    traffic: {
      way_of_transport : "Driving", // Possibilities: Driving / Transit / Walking
      bing_maps_api_key : "",
      start_trip : "",
      end_trip : "",
      reload_interval : 5 // Number of minutes the information is refreshed
    }
}
