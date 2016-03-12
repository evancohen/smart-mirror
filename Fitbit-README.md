# Fitbit setup for Smart Mirror

#### Register for Fitbit API

Sign up for the Fitbit API (https://dev.fitbit.com) and create a new application under the "REGISTER AN APP" area. Be sure to choose "Browser" and "Personal". Give the app read-only access. Set the callback URL to: http://localhost:4000/fitbit_auth_callback/

#### Setup your config.js file

Now, head over to the main config.js file and enter your Client ID key and Client secret for Fitbit under the fitbit creds section, and be sure that the callback URL you specified in your Fitbit personal application entry is set to the same value as redirect_uri in config.js. This is so that when you do the initial auth with Fitbit, their auth process takes redirects back to http://localhost:4000 - and the server running in express on port 4000 will get the callback request from fitbit and be able to persist save your token. This is a once off process. After this, the fb-token.json file is persisted and the OAuth2 library included will handle refresh tokens automatically as needed from Fitbit.

#### First time run

Run smart-mirror on your device by using: npm start dev

The first time you run and don't yet have a token persisted, the fitbit stats will fail to show and if you look at the browser console, you'll notice this error:

Error reading Fitbit token file! This might be the first time you are running the app, if so, make sure you browse to http://yourappurl:yourport/fitbit - this will redirect you to the auth page. Error: ENOENT: no such file or directory, stat 'C:\GitHub\smart-mirror\fb-token.json'

At this point, you need to open up another browser on this machine (Task switch if you need to) and navigate to http://localhost:4000/fitbit

You will be redirected to the Fitbit auth page, and as long as your Client ID and Secret were entered correctly in your config file, you'll see the page requesting access for your application. Allow and the token will be saved (you'll see fb-token.json appear in your smart-mirror root). You might get an error web page after clicking Allow - this is a hiccup in the Fitbit OAuth2 library that I have not yet smoothed out, but not to worry, the token should have been saved, so you should be good now regardless of this error.

#### Seeing your Fitbit data

If you wait for the refresh interval of the smart-mirror your fitbit stats will update at that point. Alternatively, you can issue the voice command 'show my walking' to prompt a refresh of the fitbit stats (instead of at the bottom left, they will also appear in a container in the middle of the display), or you could close the smart-mirror app (CTRL-W) and re-launch it.

#### What data is displayed?

Basic profile summary stats and the day's activities, like:

- daily average steps over all time
- your latest badges earned
- the current day's activity steps
- distance
- calories burned

You can easily modify the fitbit-service.js controller to add more API GET methods and hook these up to variables that AngularJS can watch and display in the main Smart Mirror app.