var config = {
    // Lenguage for the mirror (currently not implemented)
    lenguage : "en",
    greeting : ["Hi, sexy!", "Hello there!"], // An array of greetings to randomly choose from
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
      key : "" // Your Gliphy API key
    },
    traffic: {
      key : "", // Bing Maps API Key
      mode : "Driving", // Possibilities: Driving / Transit / Walking
      origin : "", // Start of your trip. Human readable address.
      destination : "", // Destination of your trip. Human readable address.
      name : "work", // Name of your destination ex: "work"
      reload_interval : 5 // Number of minutes the information is refreshed
    },
    fitbit: {
        "timeout": 10000,
        "creds": {
            "clientID": "CLIENTID",
            "clientSecret": "SECRET"
        },
        "uris": {
            "authorizationUri": "https://www.fitbit.com",
            "authorizationPath": "/oauth2/authorize",
            "tokenUri": "https://api.fitbit.com",
            "tokenPath": "/oauth2/token"
        },
        "authorization_uri": {
            "redirect_uri": "http://localhost:4000/fitbit_auth_callback/",
            "response_type": "code",
            "scope": "activity nutrition profile settings sleep social weight heartrate",
            "state": "3(#0/!~"
        }
    }
}
