var config = {
    // Language supported in annyang. Default en-US
    locale : "es-ES",
    greeting : ["Hola!"], // An array of greetings to randomly choose from

    sleep_timer: {
        start: 23,
        end: 06,
    },

    // forcast.io
    forcast : {
        key : "bdc696a15b3d46cebe2a303e134aa2e5", // Your forcast.io api key
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
        icals : ["https://calendar.google.com/calendar/ical/javiersigler%40javiersigler.com/private-d611ca29d244f59ff08cbb6e4deeeb21/basic.ics"],
        maxResults: 9, // Number of calender events to display (Defaults is 9)
        maxDays: 365 // Number of days to display (Default is one year)
    },
    // Giphy
    giphy: {
        key : "dc6zaTOxFJmzC" // Your Gliphy API key
    },
    traffic: {
        key : "Agus0ArdiFhA9wz0NYsav62EJNC9EXvdYJa6WXj1MeUIul3h-_GbinGnZ4BvjL3V", // Bing Maps API Key
        mode : "Driving", // Possibilities: Driving / Transit / Walking
        origin : "Calle Santiso 7, Madrid, España", // Start of your trip. Human readable address.
        destination : "Address: Sector Oficios, 12, 28760 Tres Cantos", // Destination of your trip. Human readable address.
        name : "work", // Name of your destination ex: "work"
        reload_interval : 5 // Number of minutes the information is refreshed
    }
}
