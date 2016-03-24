# Fitbit setup for Smart Mirror

#### Register for Fitbit API

Sign up for the Fitbit API (https://dev.fitbit.com) and create a new application under the "REGISTER AN APP" area. Be sure to choose "Browser" and "Personal". Give the app read-only access. Set the callback URL to: http://localhost:4000/fitbit_auth_callback/

#### Setup your config.js file

Now, head over to the main config.js file and create an object/section called 'fitbit'. This will enable fitbit stats to be displayed in the UI and allow the API calls to Fitbit to work. Your fitbit configuration needs to look like this:

fitbit: {
  "timeout": 10000,
  "creds": {
      "clientID": "YOURCLIENTID",
      "clientSecret": "YOURCLIENTSECRET"
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

Update the clientID and clientSecret properties - get these from the Fitbit application you created when you 'reigstered an app' on the Fitbit API/Developer area.

You need to also ensure that the callback URL you specified in your Fitbit personal application entry is set to the same value as redirect_uri. This is so that when you do the initial auth with Fitbit, their auth process takes redirects back to http://localhost:4000 - and the server running in express on port 4000 will get the callback request from fitbit and be able to persist/save your token. This is a once off process. After this, the fb-token.json file is persisted (you'll see it in the root of the smart-mirror directory) and the OAuth2 library included will handle refresh tokens automatically as needed from Fitbit.

#### First time run

Run smart-mirror on your device by using: npm start dev

The first time you run and don't yet have a token persisted, the fitbit stats will fail to show and if you look at the browser console, you'll notice this message:

Error reading Fitbit token file! This might be the first time you are running the app, if so, make sure you browse to http://yourappurl:yourport/fitbit - this will redirect you to the auth page. Error: ENOENT: no such file or directory, stat 'C:\GitHub\smart-mirror\fb-token.json'

At this point, you need to open up another browser on this machine (Task switch if you need to and open the Raspbian Web Browser if you are on Pi for example) and navigate to http://localhost:4000/fitbit

You will be redirected to the Fitbit auth page where you need to sign in with your fitbit details. As long as your Client ID and Secret were entered correctly in your fitbit-service.js file, you'll see the page requesting access for your application. Allow this, and the token will be saved (you'll see fb-token.json appear in your smart-mirror root). You might get an error web page after clicking Allow - this is a hiccup in the Fitbit OAuth2 library that I have not yet smoothed out, but not to worry, the token should have been saved, so you should be good now regardless of this error.

#### Seeing your Fitbit data

If you wait for the refresh interval of the smart-mirror your fitbit stats will update at that point (or the first time you start Smart Mirror). Alternatively, you can issue the voice command 'show my walking' to prompt a refresh of the fitbit stats.

#### What data is displayed?

Basic profile summary stats and the day's activities, like:

- daily average steps over all time
- your latest badges earned
- the current day's activity steps
- distance
- calories burned

You can easily modify the fitbit-service.js controller to add more API GET methods and hook these up to variables that AngularJS can watch and display in the main Smart Mirror app.

For help, please get in touch with the author of the Fitbit module/service for Smart Mirror at: https://github.com/Shogan