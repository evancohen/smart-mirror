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

		if (typeof config.spotify !== 'undefined' && config.spotify.creds.clientSecret !== '') {

            
            
            
            
//            var express = require('express');
            var request = require('request');
//            var querystring = require('querystring');
//            var cookieParser = require('cookie-parser');
//
//            var redirect_uri = 'http://localhost:4000/spotify_auth_callback';
//            var client_id = config.spotify.creds.clientID;
//            var client_secret = config.spotify.creds.clientSecret;
//            var auth_scope = config.spotify.authorization_uri.scope.split(' ');
//
//            var generateRandomString = function(length) {
//              var text = '';
//              var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//
//              for (var i = 0; i < length; i++) {
//                text += possible.charAt(Math.floor(Math.random() * possible.length));
//              }
//              return text;
//            };
//
//            var stateKey = 'spotify_auth_state';
//
//            var app = express();
//
//            app.use(express.static(__dirname + '/public'))
//               .use(cookieParser());
//
//            app.get('/authorize_spotify', function(req, res) {
//
//              var state = generateRandomString(16);
//              res.cookie(stateKey, state);
//
//              // your application requests authorization
//              res.redirect('https://accounts.spotify.com/authorize?' +
//                querystring.stringify({
//                  response_type: 'code',
//                  client_id: client_id,
//                  scope: auth_scope,
//                  redirect_uri: redirect_uri,
//                  state: state
//                }));
//            });
//
//            app.get('/spotify_auth_callback', function(req, res) {
//
//              // your application requests refresh and access tokens
//              // after checking the state parameter
//
//              var code = req.query.code || null;
//              var state = req.query.state || null;
//              var storedState = req.cookies ? req.cookies[stateKey] : null;
//
//              if (state === null || state !== storedState) {
//                res.redirect('/#' +
//                  querystring.stringify({
//                    error: 'state_mismatch'
//                  }));
//              } else {
//                res.clearCookie(stateKey);
//                var authOptions = {
//                  url: 'https://accounts.spotify.com/api/token',
//                  form: {
//                    code: code,
//                    redirect_uri: redirect_uri,
//                    grant_type: 'authorization_code'
//                  },
//                  headers: {
//                    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
//                  },
//                  json: true
//                };
//
//                request.post(authOptions, function(error, response, body) {
//                  if (!error && response.statusCode === 200) {
//
//                    var access_token = body.access_token,
//                        refresh_token = body.refresh_token;
//
//                    var options = {
//                      url: 'https://api.spotify.com/v1/me',
//                      headers: { 'Authorization': 'Bearer ' + access_token },
//                      json: true
//                    };
//
//                    // use the access token to access the Spotify Web API
//                    request.get(options, function(error, response, body) {
//                      console.log(body);
//                    });
//
//                    // we can also pass the token to the browser to make requests from there
//                    res.redirect('/#' +
//                      querystring.stringify({
//                        access_token: access_token,
//                        refresh_token: refresh_token
//                      }));
//                  } else {
//                    res.redirect('/#' +
//                      querystring.stringify({
//                        error: 'invalid_token'
//                      }));
//                  }
//                });
//              }
//            });
//
//            app.get('/refresh_token', function(req, res) {
//
//              // requesting access token from refresh token
//              var refresh_token = req.query.refresh_token;
//              var authOptions = {
//                url: 'https://accounts.spotify.com/api/token',
//                headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
//                form: {
//                  grant_type: 'refresh_token',
//                  refresh_token: refresh_token
//                },
//                json: true
//              };
//
//              request.post(authOptions, function(error, response, body) {
//                if (!error && response.statusCode === 200) {
//                  var access_token = body.access_token;
//                  res.send({
//                    'access_token': access_token
//                  });
//                }
//              });
//            });


            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
			var express = require('express');
			var app = express();
			var fs = require('fs');
			var Spotify = require('spotify-web-api-node');
            
            var client_id = config.spotify.creds.clientID;
            var client_secret = config.spotify.creds.clientSecret;
            var auth_scope = config.spotify.authorization_uri.scope.split(' ');
            var auth_state = config.spotify.authorization_uri.state;

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
                var code = req.query.code;
                
                persist.write(tokenFile, {
                    "code": code
                }, function (err) {
                    if (err) return next(err);
                    res.send('Authorization complete. Please relead your mirror to refresh authentication.');
                });
                
//				// The code that's returned as a query parameter to the redirect URI
//                var code = req.query.code;
//                
//                // Retrieve an access token and a refresh token
//                spotify.authorizationCodeGrant(code)
//                  .then(function(data) {
//					persist.write(tokenFile, data.body, function (err) {
//						if (err) return next(err);
//                        res.send('Authorization complete. Please relead your mirror to refresh authentication.');
//					});
//                  }, function(err) {
//                    console.debug('Something went wrong!', err);
//					if (err) return next(err);
//                  });
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

            
//            request.get({
//              url: 'http://localhost:4000/authorize_spotify',
//              json: true
//            }, function(error, response, body) {
////            $http.get('http://localhost:4000/authorize_spotify').success(function (response, headers) {
//                console.log(response);
                
                // Read the persisted token, initially captured by a webapp.
                fs.stat(tokenFile, function (err) {
                    if (err == null) {
//                        persist.read(tokenFile, function (err, token) {
//                            if (err) {
//                                console.error('Spotify authentication invalid format, please see the config screen for the authorization instructions.', err);
//                            } else {
//                                var access_token = token['access_token'];
//                                var refresh_token = token['refresh_token'];
//
//                                spotify.setAccessToken(access_token); // Set the client token
//                                spotify.setRefreshToken(refresh_token); // Set the client token
//                                cb();
//                            }
//                        });
                        persist.read(tokenFile, function (err, data) {
                            if (err) {
                                console.error('Spotify authentication invalid format, please see the config screen for the authorization instructions.', err);
                            } else {
                                // Retrieve an access token and a refresh token
                                spotify.authorizationCodeGrant(data.code)
                                  .then(function(data) {
                                    console.log(data);
                                    
                                    spotify.setAccessToken(data.body.access_token); // Set the client token
                                    spotify.setRefreshToken(data.body.refresh_token); // Set the client token
                                    cb();
                                  }, function(err) {
                                    console.debug('Something went wrong!', err);
                                    if (err) return next(err);
                                  });
                            }
                        });
                    } else if (err.code == 'ENOENT') {
                        console.error('Spotify authentication required, please see the config screen for the authorization instructions.', err);
                    } else {
                        console.error(err);
                    }
                });
//            });
        }

        service.refreshToken = function () {
            return spotify.refreshAccessToken().then(function (data) {
                return data.body;
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
        
        service.pause = function () {
            return spotify.pause()
              .then(function(data) {}, function(err) {
                console.log('Something went wrong!', err);
              });
        };
        
        service.skipBack = function () {
            return spotify.skipToPrevious()
              .then(function(data) {}, function(err) {
                console.log('Something went wrong!', err);
              });
        };
        
        service.skipNext = function () {
            return spotify.skipToNext()
              .then(function(data) {}, function(err) {
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
            if (typeof query === 'undefined') {
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

        service.playPlaylist = function (query) {
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
