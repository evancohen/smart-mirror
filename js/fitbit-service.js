(function() {
    'use strict';

    var express = require('express');
    var app     = express();
    var fs      = require( 'fs' );
    var Fitbit  = require( 'fitbit-oauth2' );

    function FitbitService($http) {
        var service = {};
        var summary = null;
        var today = null;
        
        // Simple token persist functions.
        //
        var tfile = 'fb-token.json';
        var persist = {
            read: function( filename, cb ) {
                fs.readFile( filename, { encoding: 'utf8', flag: 'r' }, function( err, data ) {
                    if ( err ) return cb( err );
                    try {
                        var token = JSON.parse( data );
                        cb( null, token );
                    } catch( err ) {
                        cb( err );
                    }
                });
            },
            write: function( filename, token, cb ) {
                console.log( 'persisting new token:', JSON.stringify( token ) );
                fs.writeFile( filename, JSON.stringify( token ), cb );
            }
        };

        // Instanciate a fitbit client.  See example config below.
        //
        var fitbit = new Fitbit( config.fitbit ); 

        // In a browser, http://localhost:4000/fitbit to authorize a user for the first time.
        //
        app.get('/fitbit', function (req, res) {
            res.redirect( fitbit.authorizeURL() );
        });

        // Callback service parsing the authorization token and asking for the access token.  This
        // endpoint is refered to in config.fitbit.authorization_uri.redirect_uri.  See example
        // config below.
        //
        app.get('/fitbit_auth_callback', function (req, res, next) {
            var code = req.query.code;
            fitbit.fetchToken( code, function( err, token ) {
                if ( err ) return next( err );

                // persist the token
                persist.write( tfile, token, function( err ) {
                    if ( err ) return next( err );
                    res.redirect( '/fb-profile' );
                });
            });
        });

        // Call an API.  fitbit.request() mimics nodejs request() library, automatically
        // adding the required oauth2 headers.  The callback is a bit different, called
        // with ( err, body, token ).  If token is non-null, this means a refresh has happened
        // and you should persist the new token.
        //
        app.get( '/fb-profile', function( req, res, next ) {
            fitbit.request({
                uri: "https://api.fitbit.com/1/user/-/profile.json",
                method: 'GET',
            }, function( err, body, token ) {
                if ( err ) return next( err );
                var profile = JSON.parse( body );
                // if token is not null, a refesh has happened and we need to persist the new token
                if ( token )
                    persist.write( tfile, token, function( err ) {
                        if ( err ) return next( err );
                            res.send( '<pre>' + JSON.stringify( profile, null, 2 ) + '</pre>' );
                    });
                else
                    res.send( '<pre>' + JSON.stringify( profile, null, 2 ) + '</pre>' );
            });
        });

        var port = process.env.PORT || 4000;
        console.log('express is listening on: ', port);
        app.listen(port);

        // Read the persisted token, initially captured by a webapp.
        //

        fs.stat(tfile, function(err, stat) {
            if(err == null) {
                console.log('Fitbit token File exists');

                persist.read( tfile, function( err, token ) {
                    if ( err ) {
                        console.log('persist read error: ', err );
                        process.exit(1);
                    }

                    // Set the client's token
                    fitbit.setToken(token);

                    // Make an API call
                    fitbit.request({
                        uri: "https://api.fitbit.com/1/user/-/profile.json",
                        method: 'GET',
                    }, function( err, body, token ) {
                        if ( err ) {
                            console.log( err );
                            process.exit(1);
                        }
                        //console.log( JSON.stringify( JSON.parse( body ), null, 2 ) );

                        // If the token arg is not null, then a refresh has occured and
                        // we must persist the new token.
                        if ( token )
                            persist.write( tfile, token, function( err ) {
                            if ( err ) console.log( err );
                                process.exit(0);
                            });
                        else {
                            //process.exit(0);
                        }
                    });
                });

            } else if(err.code == 'ENOENT') {
                console.log('Error reading Fitbit token file! This might be the first time you are running the app, if so, make sure you browse to http://yourappurl:yourport/fitbit - this will redirect you to the auth page.', err);
            } else {
                console.log(err);
            }
        });

        service.init = function() {
            console.log('fitbit begin init...');
            return $http({
              method: 'GET',
              url: 'http://jsonplaceholder.typicode.com/users'
            }).then(function(response) {
                    // var reportSummary = JSON.parse(response.body);
                    // console.log(reportSummary);
                    //return service.forcast = response;
                    console.log('done initializing Fitbit service');
                });
        };

        service.profileSummary = function(callback) {
            if(service.summary === null){
                return null;
            }

            // Make an API call
            fitbit.request({
                uri: "https://api.fitbit.com/1/user/-/profile.json",
                method: 'GET',
            }, function( err, body, token ) {
                if ( err ) {
                    console.log( err );
                    //process.exit(1);
                }
                //console.log( JSON.stringify( JSON.parse( body ), null, 2 ) );

                var res = JSON.parse(body);

                // If the token arg is not null, then a refresh has occured and
                // we must persist the new token.
                if ( token )
                    persist.write( tfile, token, function( err ) {
                    if ( err ) console.log( err );
                        process.exit(0);
                    });
                else {
                    //process.exit(0);
                }

                //console.log(res.user);
                return callback(res.user);
            });
        }

        service.todaySummary = function(callback) {
            if(service.today === null){
                return null;
            }

            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!
            var yyyy = today.getFullYear();

            if(dd<10) {
                dd='0'+dd
            } 

            if(mm<10) {
                mm='0'+mm
            } 

            today = yyyy+'-'+mm+'-'+dd;
                
            // Make an API call
            fitbit.request({
                uri: "https://api.fitbit.com/1/user/-/activities/date/" + today + ".json",
                method: 'GET',
            }, function( err, body, token ) {
                if ( err ) {
                    console.log( err );
                    //process.exit(1);
                }
                //console.log( JSON.stringify( JSON.parse( body ), null, 2 ) );

                var res = JSON.parse(body);
                //console.log( res.user);
                //console.log(res);
                // If the token arg is not null, then a refresh has occured and
                // we must persist the new token.
                if ( token )
                    persist.write( tfile, token, function( err ) {
                    if ( err ) console.log( err );
                        process.exit(0);
                    });
                else {
                    //process.exit(0);
                }

                return callback(res);
            });
        }
        
        return service;
    }

    angular.module('SmartMirror')
        .factory('FitbitService', FitbitService);

}());
