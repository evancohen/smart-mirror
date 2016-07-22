(function() {
    'use strict';
    
    function FitbitService($http) {

        var service = {};
        var summary = null;
        var today = null;
        
        // Simple token persist functions.
        //
        var tfile = 'fb-token.json';
        var persist = {
            read: function(filename, cb) {
                fs.readFile(filename, { encoding: 'utf8', flag: 'r' }, function(err, data) {
                    if (err) return cb(err);
                    try {
                        var token = JSON.parse(data);
                        cb(null, token);
                    } catch(err) {
                        cb(err);
                    }
                });
            },
            write: function(filename, token, cb) {
                console.log('persisting new token:', JSON.stringify(token));
                fs.writeFile(filename, JSON.stringify( token ), cb);
            }
        };

        service.getToday = function(){
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!
            var yyyy = today.getFullYear();

            // Add padding for the date, (we want 0x where x is the day or month number if its less than 10)
            if(dd<10) {
                dd='0'+dd;
            } 

            if(mm<10) {
                mm='0'+mm
            } 

            return yyyy+'-'+mm+'-'+dd;
        }

        // Instantiate a fitbit client.
        //
        var fitbit = {};
        if (typeof config.fitbit != 'undefined') {
            fitbit = new Fitbit(config.fitbit); 

            var express = require('express');
            var app     = express();
            var fs      = require( 'fs' );
            var Fitbit  = require( 'fitbit-oauth2' );

            // In a browser, http://localhost:4000/fitbit to authorize a user for the first time.
            //
            app.get('/fitbit', function (req, res) {
                res.redirect(fitbit.authorizeURL());
            });

            // Callback service parsing the authorization token and asking for the access token.  This
            // endpoint is refered to in config.fitbit.authorization_uri.redirect_uri.  See example
            // config below.
            //
            app.get('/fitbit_auth_callback', function (req, res, next) {
                var code = req.query.code;
                fitbit.fetchToken( code, function(err, token) {
                    if (err) return next(err);

                    // persist the token
                    persist.write(tfile, token, function(err) {
                        if (err) return next(err);
                        res.redirect('/fb-profile');
                    });
                });
            });

            // Call an API. fitbit.request() mimics nodejs request() library, automatically
            // adding the required oauth2 headers.  The callback is a bit different, called
            // with ( err, body, token ).  If token is non-null, this means a refresh has happened
            // and you should persist the new token.
            //
            app.get( '/fb-profile', function(req, res, next) {
                fitbit.request({
                    uri: "https://api.fitbit.com/1/user/-/profile.json",
                    method: 'GET',
                }, function(err, body, token) {
                    if (err) return next(err);
                    var profile = JSON.parse(body);
                    // if token is not null, a refesh has happened and we need to persist the new token
                    if (token)
                        persist.write(tfile, token, function(err) {
                            if (err) return next(err);
                                res.send('<pre>' + JSON.stringify(profile, null, 2) + '</pre>');
                        });
                    else
                        res.send('<pre>' + JSON.stringify(profile, null, 2) + '</pre>');
                });
            });
        }

        // Only start up express and enable the fitbit service to start making API calls if the fitbit config is present in config.js.
        if (typeof config.fitbit != 'undefined') {
            // do express and Fitbit things
            var port = process.env.PORT || 4000;
            console.log('express is listening on port: ', port);
            app.listen(port);
            // Read the persisted token, initially captured by a webapp.
            //
            fs.stat(tfile, function(err, stat) {
                if(err == null) {
                    console.log('Fitbit token File exists');

                    persist.read(tfile, function(err, token) {
                        if (err) {
                            console.log('persist read error: ', err);
                        }

                        // Set the client's token
                        fitbit.setToken(token);
                    });
                } else if(err.code == 'ENOENT') {
                    console.log('Error reading Fitbit token file! This might be the first time you are running the app, if so, make sure you browse to http://yourappurl:yourport/fitbit - this will redirect you to the auth page.', err);
                } else {
                    console.log(err);
                }
            });
        }

        service.profileSummary = function(callback) {
            if(service.summary === null){
                return null;
            }

            // Make an API call to get the fitbit user's profile data
            fitbit.request({
                uri: "https://api.fitbit.com/1/user/-/profile.json",
                method: 'GET',
            }, function( err, body, token ) {
                if (err) {
                    console.log(err);

                }
                var result = JSON.parse(body);

                // If the token arg is not null, then a refresh has occured and
                // we must persist the new token.
                if (token) {
                    persist.write( tfile, token, function(err) {
                        if (err) console.log(err);
                    });
                }
                return callback(result.user);
            });
        }

        service.todaySummary = function(callback) {
            if(service.today === null){
                return null;
            }

            today = service.getToday();
                
            // Make an API call to get the users activities for today
            fitbit.request({
                uri: "https://api.fitbit.com/1/user/-/activities/date/" + today + ".json",
                method: 'GET',
            }, function(err, body, token) {
                if (err) {
                    console.log(err);
                }
                var result = JSON.parse(body);
                console.log(result);
                // If the token arg is not null, then a refresh has occured and
                // we must persist the new token.
                if (token) {
                    persist.write(tfile, token, function(err) {
                        if (err) console.log(err);
                    });
                }
                return callback(result);
            });


        }

        service.sleepSummary = function(callback) {
            if(service.today === null){
                return null;
            }

            today = service.getToday();
                
            // Make an API call to get the users sleep summary for today
            fitbit.request({
                uri: "https://api.fitbit.com/1/user/-/sleep/date/" + today + ".json",
                method: 'GET',
            }, function(err, body, token) {
                if (err) {
                    console.log(err);
                }
                var result = JSON.parse(body);
                console.log(result);
                // If the token arg is not null, then a refresh has occured and
                // we must persist the new token.
                if (token) {
                    persist.write(tfile, token, function(err) {
                        if (err) console.log(err);
                    });
                }
                return callback(result);
            });

            
        }
        
        service.deviceSummary = function(callback) {
            if(service.today === null){
                return null;
            }

            // Make an API call to get the users device status
            fitbit.request({
                uri: "https://api.fitbit.com/1/user/-/devices.json",
                method: 'GET',
            }, function(err, body, token) {
                if (err) {
                    console.log(err);
                }
                var result = JSON.parse(body);
                console.log(result);
                // If the token arg is not null, then a refresh has occured and
                // we must persist the new token.
                if (token) {
                    persist.write(tfile, token, function(err) {
                        if (err) console.log(err);
                    });
                }
                return callback(result);
            });

            
        }

        return service;
    }

    angular.module('SmartMirror')
        .factory('FitbitService', FitbitService);

}());
