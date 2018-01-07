/* global SC:true */
(function () {
	'use strict';

	function SpotifyService($http) {
		var service = {};
        var spotify = {};
		var tokenFile = 'fb-token.json';

        /**
         * Persist the fitbit token.
         */
		var persist = {
			read: function (filename, cb) {
				fs.readFile(filename, { encoding: 'utf8', flag: 'r' }, function (err, data) {
					if (err) return cb(err);
					try {
						var token = JSON.parse(data);
						cb(null, token);
					} catch (err) {
						cb(err);
					}
				});
			},

			write: function (filename, token, cb) {
				console.debug('Persisting new token: ' + JSON.stringify(token));
				fs.writeFile(filename, JSON.stringify(token), cb);
			}
		};
        
		service.spotifyResponse = null;

        /**
         * Instantiate the spotify client.
         */
		if (typeof config.spotify != 'undefined') {
			var express = require('express');
			var app = express();
			var fs = require('fs');
			var Spotify = require('spotify-web-api-node');
            
            var client_id = config.spotify.creds.clientID;
            var client_secret = config.spotify.creds.clientSecret;
            var redirect_uri =  config.spotify.authorization_uri.redirect_uri;
            var auth_scope =  config.spotify.authorization_uri.scope.split(' ');
            var auth_state = config.spotify.authorization_uri.state;

			spotify = new Spotify({
                clientId : client_id,
                clientSecret : client_secret,
                redirectUri : redirect_uri
            });
            console.log(config.spotify);
            
			// In a browser, visit http://localhost:4000/spotify to authorize a user for the first time.
			app.get('/spotify', function (req, res) {
				res.redirect(spotify.createAuthorizeURL(auth_scope, auth_state));
			});

            /*
                Callback service parsing the authorization token and asking for the access token. 
                This endpoint is refered to in config.spotify.authorization_uri.redirect_uri.
             */
			app.get('/spotify_auth_callback', function (req, res, next) {
				// The code that's returned as a query parameter to the redirect URI
                var code = req.query.code;
                
                

                // Retrieve an access token and a refresh token
                spotify.authorizationCodeGrant(code, function(data) {
                    console.log('The token expires in ' + data.body['expires_in']);
                    console.log('The access token is ' + data.body['access_token']);
                    console.log('The refresh token is ' + data.body['refresh_token']);

                    // Set the access token on the API object to use it in later calls
                    spotify.setAccessToken(data.body['access_token']);
                    spotify.setRefreshToken(data.body['refresh_token']);
                    
                    // persist the token
					persist.write(tokenFile, token, function (err) {
						if (err) return next(err);
						res.redirect('/fb-profile');
					});
//                  }, function(err) {
//                    console.log('Something went wrong!', err);
                  });
                
                
                
                
//				spotify.fetchToken(code, function (err, token) {
//					if (err) return next(err);
//
//					// persist the token
//					persist.write(tokenFile, token, function (err) {
//						if (err) return next(err);
//						res.redirect('/fb-profile');
//					});
//				});
			});

            /*
                Call an API. spotify.request() mimics nodejs request() library, 
                automatically adding the required oauth2 header. The callback 
                is a bit different, called with (err, body, token). If token is 
                non-null, this means a refresh has happened and you should 
                persist the new token.
            */
			app.get('/spotify-profile', function (req, res, next) {
				spotify.request({
					uri: "https://api.spotify.com/1/user/-/profile.json",
					method: 'GET',
				}, function (err, body, token) {
					if (err) {
						return next(err);
					}

					var profile = JSON.parse(body);

					// If token is present, refresh.
					if (token)
						persist.write(tokenFile, token, function (err) {
							if (err) return next(err);
							res.send('<pre>' + JSON.stringify(profile, null, 2) + '</pre>');
						});
					else
						res.send('<pre>' + JSON.stringify(profile, null, 2) + '</pre>');
				});
			});
		}

		service.init = function () {
			var port = process.env.PORT || 4000;
			console.debug('Express is listening on port: ' + port);
			app.listen(port);

			// Read the persisted token, initially captured by a webapp.
			fs.stat(tokenFile, function (err) {
				if (err == null) {
					persist.read(tokenFile, function (err, token) {
						if (err) {
							console.error('Persist read error!', err);
						}

						spotify.setToken(token); // Set the client token
						cb()
					});
				} else if (err.code == 'ENOENT') {
					console.error('Spotify authentication required, please visit the following link: http://localhost:4000/spotify to authenticate your credentials.', err);
				} else {
					console.error(err);
				}
			});
            
            
////            Spotify.config.spotify.auth_url = 'https://accounts.spotify.com/authorize?' +
////                querystring.stringify({
////                  response_type: 'code',
////                  client_id: client_id,
////                  scope: scope,
////                  redirect_uri: redirect_uri,
////                  state: state
////                }));
//            
//            
////			if (typeof config.spotify != 'undefined' && config.spotify.length) {
//                spotify.setAccessToken(config.spotify.access_token);
//                spotify.setRefreshToken(config.spotify.refresh_token);
//            
//                // Get the authenticated user
//                spotify.getMe()
//                  .then(function(data) {
//                    console.log('Current authenticated user:', data.body);
//                  }, function(err) {
//                    console.log('Something went wrong!', err);
//                  });
//            
////                spotify.getMyRecentlyPlayedTracks()
////                  .then(function(data) {
////                    console.log('recent tracks:', data.body);
////                  }, function(err) {
////                    console.log('Something went wrong!', err);
////                  });
//            
//                spotify.getMyDevices()
//                  .then(function(data) {
//                    console.log('user devices:', data.body);
//                  }, function(err) {
//                    console.log('Something went wrong!', err);
//                  });
//            
//                spotify.getMyCurrentPlayingTrack()
//                  .then(function(data) {
//                    console.log('current track:', data.body);
//                  }, function(err) {
//                    console.log('Something went wrong!', err);
//                  });
//            
//                spotify.getMyCurrentPlaybackState()
//                  .then(function(data) {
//                    console.log('current playback:', data.body);
//                  }, function(err) {
//                    console.log('Something went wrong!', err);
//                  });
//            
////                spotify.transferMyPlayback()
////                  .then(function(data) {
////                    console.log('current playback:', data.body);
////                  }, function(err) {
////                    console.log('Something went wrong!', err);
////                  });
//            
////                // Get the credentials one by one
////                console.log('The access token is ' + spotify.getAccessToken());
////                console.log('The refresh token is ' + spotify.getRefreshToken());
////
////                // Get all credentials
////                console.log('The credentials are ', spotify.getCredentials());
//            
////                spotify.refreshAccessToken()
////                  .then(function(data) {
////                    console.log('The access token has been refreshed!');
////
////                    // Save the access token so that it's used in future calls
////                    spotify.setAccessToken(data.body['access_token']);
////                  }, function(err) {
////                    console.log('Could not refresh access token', err);
////                  });
//                
////            }
		}
        
        service.playTrack = function (query) {
            // Search tracks whose name contains the query
            return spotify.searchTracks('track:' + query)
              .then(function(data) {
                console.log('Search tracks matching "' + query + '"');
                console.log(data);
                service.spotifyResponse = data.body.tracks || null;
                
                var options = {
                    "uris": [
                        data.body.tracks.items[0].uri
                    ]
                };
                console.log(options);
                
                return spotify.play(options)
                  .then(function(data) {
                    console.log('current playback: "' + query + '"');
                    console.log(data);
                    service.spotifyResponse = data.body.tracks || null;
                    return service.spotifyResponse;
                  }, function(err) {
                    console.log('Something went wrong!', err);
                  });
              }, function(err) {
                console.log('Something went wrong!', err);
              });
        };

        service.searchTrack = function (query) {
            // Search tracks whose name contains the query
            return spotify.searchTracks('track:' + query)
              .then(function(data) {
                console.log('Search tracks matching "' + query + '"');
                console.log(data);
                service.spotifyResponse = data.body.tracks || null;
                return service.spotifyResponse;
              }, function(err) {
                console.log('Something went wrong!', err);
              });
        };

        service.getPlaylist = function (query) {
            // Search tracks whose name contains the query
            return spotify.getUserPlaylists(query)
              .then(function(data) {
                console.log('Playlist matching "' + query + '"');
                console.log(data);
//                service.spotifyResponse = data.body.tracks || null;
//                return service.spotifyResponse;
              }, function(err) {
                console.log('Something went wrong!', err);
              });
        };

		return service;
	}

	angular.module('SmartMirror')
    .factory('SpotifyService', SpotifyService);

} ());
