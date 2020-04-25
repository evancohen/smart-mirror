(function () {
	'use strict';

	function SpotifyService() {
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

		if (typeof config.spotify !== 'undefined' && typeof config.spotify.creds.clientSecret !== 'undefined' && config.spotify.creds.clientSecret !== '') {
			var express = require('express');
			var app = express();
			var fs = require('fs');
			var Spotify = require('spotify-web-api-node');
            
			var client_id = config.spotify.creds.clientID;
			var client_secret = config.spotify.creds.clientSecret;
			var auth_scope = config.spotify.authorization_uri.scope.split(' ');
			var auth_state = config.spotify.authorization_uri.state;
			var default_device = config.spotify.default_device || null;

			spotify = new Spotify({
				clientId : client_id,
				clientSecret : client_secret,
				redirectUri : 'http://localhost:4000/spotify_auth_callback'
			});
            
			// In a browser, visit http://localhost:4000/spotify to authorize a user for the first time.
			app.get('/authorize_spotify', function (req, res) {
				res.redirect(spotify.createAuthorizeURL(auth_scope, auth_state));
			});

			app.get('/spotify_auth_callback', function (req, res, next) {
				// The code that's returned as a query parameter to the redirect URI
				var code = req.query.code;
                
				// Retrieve an access token and a refresh token
				spotify.authorizationCodeGrant(code)
					.then(function(data) {
						persist.write(tokenFile, data.body, function (err) {
							if (err) return next(err);
							res.send('Authorization complete. Please relead your mirror to refresh authentication.');
						});
					}, function(err) {
						console.debug('Something went wrong!', err);
						if (err) return next(err);
					});
			});
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
							console.error('Spotify authentication invalid format, please see the config screen for the authorization instructions.', err);
						} else {
							var access_token = token['access_token'];
							var refresh_token = token['refresh_token'];

							if (!default_device) console.debug('no default spotify device chosen');
                            
							spotify.setAccessToken(access_token); // Set the client token
							spotify.setRefreshToken(refresh_token); // Set the client token
							//                            if (authorized_session) cb();
							cb();
						}
					});
				} else if (err.code == 'ENOENT') {
					console.error('Spotify authentication required, please see the config screen for the authorization instructions.', err);
				} else {
					console.error(err);
				}
			});
		}

		service.refreshToken = function () {
			spotify.refreshAccessToken().then(function (data) {
				data.body.refresh_token = spotify.getRefreshToken();
                
				var access_token = data.body.access_token;
				var refresh_token = data.body.refresh_token;
                
				persist.write(tokenFile, data.body, function (err) {
					if (err) console.error('authentication renewal write failed.', err);

					spotify.setAccessToken(access_token); // Set the client token
					spotify.setRefreshToken(refresh_token); // Set the client token
				});
			});
		};
        
		service.currentState = function () {
			return spotify.getMyCurrentPlaybackState()
				.then(function(data) {
					service.spotifyResponse = data.body || null;
					return service.spotifyResponse;
				}, function(err) {
					service.active = false;
					console.log('Something went wrong!', err);
				});
		};
        
		service.sendToDevice = function (name) {
			spotify.getMyDevices().then(function (data) {
				var devices = data.body.devices;
				var id = null;
                
				// Check for name kerword of <named_device> or 'this device'<default_device>
				name = (name.toLowerCase() === 'this device' && default_device)? default_device: name;
                
				devices.forEach(function (device) {
					if (device.name.toLowerCase().indexOf(name.toLowerCase()) >= 0) {
						id = device.id;
					}
				});
				if (id) {
					console.log(id);
					return spotify.transferMyPlayback({ 
						"device_ids": [
							id
						]
					}).then(function() {
						return spotify.play();
					}, function(err) {
						console.log('Something went wrong!', err);
					});
				} else {
					return null;
				}
			});
		};
        
		service.pause = function () {
			return spotify.pause()
				.then(function() {}, function(err) {
					console.log('Something went wrong!', err);
				});
		};
        
		service.skipBack = function () {
			return spotify.skipToPrevious()
				.then(function() {}, function(err) {
					console.log('Something went wrong!', err);
				});
		};
        
		service.skipNext = function () {
			return spotify.skipToNext()
				.then(function() {}, function(err) {
					console.log('Something went wrong!', err);
				});
		};
        
		service.toggleShuffle = function (state) {
			return spotify.setShuffle({ "state": state })
				.then(function(data) {
					console.log(data);
				}, function(err) {
					console.log('Something went wrong!', err);
				});
		};
        
		service.toggleRepeat = function (state) {
			return spotify.setRepeat({ "state": state })
				.then(function(data) {
					console.log(data);
				}, function(err) {
					console.log('Something went wrong!', err);
				});
		};
        
		service.playTrack = function (query) {
			console.log(query, typeof query);
			if (typeof query === 'undefined' || query === '' || query === ' ') {
				return spotify.play();
			} else {
				query = (query.charAt(0) === ' ')? query.substring(1): query;
				return spotify.searchTracks('track:' + query)
					.then(function(data) {
						console.log('Search tracks matching "' + query + '"');
						console.log(data);

						var tracks = [];
						data.body.tracks.items.forEach(function(item) {
							tracks.push(item.uri);
						});
						console.log(tracks);

						return spotify.play({ "uris": tracks })
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
			}
		};

		return service;
	}

	angular.module('SmartMirror')
		.factory('SpotifyService', SpotifyService);

} ());
