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
            var options = {
                clientId : config.spotify.creds.clientID,
                clientSecret : config.spotify.creds.clientSecret,
                redirectUri : config.spotify.authorization_uri.redirect_uri
            };

			spotify = new Spotify(options);
			// In a browser, visit http://localhost:4000/spotify to authorize a user for the first time.
			app.get('/spotify', function (req, res) {
				res.redirect(spotify.createAuthorizeURL());
			});

            /*
                Callback service parsing the authorization token and asking for the access token. 
                This endpoint is refered to in config.spotify.authorization_uri.redirect_uri.
             */
			app.get('/spotify_auth_callback', function (req, res, next) {
				var code = req.query.code;
				spotify.fetchToken(code, function (err, token) {
					if (err) return next(err);

					// persist the token
					persist.write(tokenFile, token, function (err) {
						if (err) return next(err);
						res.redirect('/fb-profile');
					});
				});
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
//                spotifyApi.setAccessToken(config.spotify.access_token);
//                spotifyApi.setRefreshToken(config.spotify.refresh_token);
//            
//                // Get the authenticated user
//                spotifyApi.getMe()
//                  .then(function(data) {
//                    console.log('Current authenticated user:', data.body);
//                  }, function(err) {
//                    console.log('Something went wrong!', err);
//                  });
//            
////                spotifyApi.getMyRecentlyPlayedTracks()
////                  .then(function(data) {
////                    console.log('recent tracks:', data.body);
////                  }, function(err) {
////                    console.log('Something went wrong!', err);
////                  });
//            
//                spotifyApi.getMyDevices()
//                  .then(function(data) {
//                    console.log('user devices:', data.body);
//                  }, function(err) {
//                    console.log('Something went wrong!', err);
//                  });
//            
//                spotifyApi.getMyCurrentPlayingTrack()
//                  .then(function(data) {
//                    console.log('current track:', data.body);
//                  }, function(err) {
//                    console.log('Something went wrong!', err);
//                  });
//            
//                spotifyApi.getMyCurrentPlaybackState()
//                  .then(function(data) {
//                    console.log('current playback:', data.body);
//                  }, function(err) {
//                    console.log('Something went wrong!', err);
//                  });
//            
////                spotifyApi.transferMyPlayback()
////                  .then(function(data) {
////                    console.log('current playback:', data.body);
////                  }, function(err) {
////                    console.log('Something went wrong!', err);
////                  });
//            
////                // Get the credentials one by one
////                console.log('The access token is ' + spotifyApi.getAccessToken());
////                console.log('The refresh token is ' + spotifyApi.getRefreshToken());
////
////                // Get all credentials
////                console.log('The credentials are ', spotifyApi.getCredentials());
//            
////                spotifyApi.refreshAccessToken()
////                  .then(function(data) {
////                    console.log('The access token has been refreshed!');
////
////                    // Save the access token so that it's used in future calls
////                    spotifyApi.setAccessToken(data.body['access_token']);
////                  }, function(err) {
////                    console.log('Could not refresh access token', err);
////                  });
//                
////            }
		}
        
        service.playTrack = function (query) {
            // Search tracks whose name contains the query
            return spotifyApi.searchTracks('track:' + query)
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
                
                return spotifyApi.play(options)
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
            return spotifyApi.searchTracks('track:' + query)
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
            return spotifyApi.getUserPlaylists(query)
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
