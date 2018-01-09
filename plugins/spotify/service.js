/* global SC:true */
(function () {
	'use strict';

	function SpotifyService($http) {
		var service = {};
        var spotify = {};
		var tokenFile = 'spotify-token.json';
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
		service.active = null;

		if (typeof config.spotify != 'undefined') {
			var express = require('express');
			var app = express();
			var fs = require('fs');
			var Spotify = require('spotify-web-api-node');
            
            var client_id = config.spotify.creds.clientID;
            var client_secret = config.spotify.creds.clientSecret;
            var redirect_uri = config.spotify.authorization_uri.redirect_uri;
            var auth_scope = config.spotify.authorization_uri.scope.split(' ');
            var auth_state = config.spotify.authorization_uri.state;

			spotify = new Spotify({
                clientId : client_id,
                clientSecret : client_secret,
                redirectUri : 'http://localhost:4000/' + redirect_uri + '/'
            });
            
			// In a browser, visit http://localhost:4000/spotify to authorize a user for the first time.
			app.get('/authorize_spotify', function (req, res) {
				res.redirect(spotify.createAuthorizeURL(auth_scope, auth_state));
			});

			app.get('/' + redirect_uri, function (req, res, next) {
				// The code that's returned as a query parameter to the redirect URI
                var code = req.query.code;
                
                // Retrieve an access token and a refresh token
                spotify.authorizationCodeGrant(code)
                  .then(function(data) {
                    // persist the token
					persist.write(tokenFile, data.body, function (err) {
						if (err) return next(err);
//						res.redirect('/spotify-profile');
                        res.send('Authorization complete.');
					});
                  }, function(err) {
                    console.debug('Something went wrong!', err);
					if (err) return next(err);
                  });
			});

//			app.get('/spotify-profile', function (req, res, next) {
//				spotify.request({
//					uri: "https://api.spotify.com/1/user/-/profile.json",
//					method: 'GET',
//				}, function (err, body, token) {
//					if (err) {
//						return next(err);
//					}
//
//					var profile = JSON.parse(body);
//
//					// If token is present, refresh.
//					if (token)
//						persist.write(tokenFile, token, function (err) {
//							if (err) return next(err);
//							res.send('<pre>' + JSON.stringify(profile, null, 2) + '</pre>');
//						});
//					else
//						res.send('<pre>' + JSON.stringify(profile, null, 2) + '</pre>');
//				});
//			});
		}

		service.init = function (cb) {
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
                        
                        var access_token = token['access_token'];
                        var refresh_token = token['refresh_token'];

						spotify.setAccessToken(access_token); // Set the client token
						spotify.setRefreshToken(refresh_token); // Set the client token
                        cb();
					});
				} else if (err.code == 'ENOENT') {
					console.error('Spotify authentication required, please visit the following link: http://localhost:4000/spotify to authenticate your credentials.', err);
				} else {
					console.error(err);
				}
			});
        }

        service.refreshToken = function () {
            return spotify.refreshAccessToken().then(function (data) {
                return data.body;
            });
        };
        
        service.profileSummary = function () {
            return spotify.getMe()
              .then(function(data) {
                service.active = true;
                return data.body;
              }, function(err) {
                service.active = false;
                console.log('Something went wrong!', err);
              });
        };
        
        service.activeDevice = function () {
            return spotify.getMyCurrentPlaybackState()
              .then(function(data) {
                service.active = true;
                return data.body;
              }, function(err) {
                service.active = false;
                console.log('Something went wrong!', err);
              });
        };
        
        service.whatIsPlaying = function () {
            return spotify.getMyCurrentPlayingTrack()
              .then(function(data) {
                service.spotifyResponse = data.body.item || null;
                return service.spotifyResponse;
              }, function(err) {
                service.active = false;
                console.log('Something went wrong!', err);
              });
        };
        
        service.play = function () {
            return spotify.play()
              .then(function(data) {
                console.log(data);
              }, function(err) {
                console.log('Something went wrong!', err);
              });
        };
        
        service.pause = function () {
            return spotify.pause()
              .then(function(data) {
                console.log(data);
              }, function(err) {
                console.log('Something went wrong!', err);
              });
        };
        
        service.skipBack = function () {
            return spotify.skipToPrevious()
              .then(function(data) {
                console.log(data);
              }, function(err) {
                console.log('Something went wrong!', err);
              });
        };
        
        service.skipNext = function () {
            return spotify.skipToNext()
              .then(function(data) {
                console.log(data);
              }, function(err) {
                console.log('Something went wrong!', err);
              });
        };
        
        service.playTrack = function (query) {
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
        
        service.playArtistTrack = function (query) {
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
