(function () {
	'use strict';

	function FitbitService() {

		var service = {};
		var today = null;
		var fitbit = {};
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

        /**
         * Get today's date in the format YYYY-MM-DD. The date is used to 
         */
		service.getToday = function () {
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1; //January is 0!
			var yyyy = today.getFullYear();

			if (dd < 10) {
				dd = '0' + dd;
			}

			if (mm < 10) {
				mm = '0' + mm;
			}
			// Add padding for the date, (we want 0x where x is the day or month number if its less than 10)
			return yyyy + '-' + mm + '-' + dd;
		}

        /**
         * Instantiate the fitbit client.
         */
		if (typeof config.fitbit != 'undefined') {
			var express = require('express');
			var app = express();
			var fs = require('fs');
			var Fitbit = require('fitbit-oauth2');

			fitbit = new Fitbit(config.fitbit);
			// In a browser, visit http://localhost:4000/fitbit to authorize a user for the first time.
			app.get('/fitbit', function (req, res) {
				res.redirect(fitbit.authorizeURL());
			});

            /*
                Callback service parsing the authorization token and asking for the access token. 
                This endpoint is refered to in config.fitbit.authorization_uri.redirect_uri.
             */
			app.get('/fitbit_auth_callback', function (req, res, next) {
				var code = req.query.code;
				fitbit.fetchToken(code, function (err, token) {
					if (err) return next(err);

					// persist the token
					persist.write(tokenFile, token, function (err) {
						if (err) return next(err);
						res.redirect('/fb-profile');
					});
				});
			});

            /*
                Call an API. fitbit.request() mimics nodejs request() library, 
                automatically adding the required oauth2 header. The callback 
                is a bit different, called with (err, body, token). If token is 
                non-null, this means a refresh has happened and you should 
                persist the new token.
            */
			app.get('/fb-profile', function (req, res, next) {
				fitbit.request({
					uri: "https://api.fitbit.com/1/user/-/profile.json",
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

        /**
         * Init function
         * If the fitbit configuration is present in the config.json, then express along with the fitbit service will be enabled.
         */
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

						fitbit.setToken(token); // Set the client token
						cb()
					});
				} else if (err.code == 'ENOENT') {
					console.error('Fitbit authentication required, please visit the following link: http://localhost:4000/fitbit to authenticate your credentials.', err);
				} else {
					console.error(err);
				}
			});
		}

        /**
         * Profile Summary
         * - Makes an API call to fitibt requesting the users profile summary.
         */
		service.profileSummary = function (callback) {
			if (service.summary === null) {
				return null;
			}

			fitbit.request({
				uri: "https://api.fitbit.com/1/user/-/profile.json",
				method: 'GET',
			}, function (err, body, token) {
				if (err) {
					console.log(err);

				}
				var result = JSON.parse(body);

				// If token is present, refresh.
				if (token) {
					persist.write(tokenFile, token, function (err) {
						if (err) console.log(err);
					});
				}

				//console.log(JSON.stringify(result));
				return callback(result.user);
			});
		}

        /**
         * Today's Summary
         * - Makes a call to the fitbit API, requesting the summary of activities for today's date.
         */
		service.todaySummary = function (callback) {
			if (service.today === null) {
				return null;
			}

			today = service.getToday();

			fitbit.request({
				uri: "https://api.fitbit.com/1/user/-/activities/date/" + today + ".json",
				method: 'GET',
			}, function (err, body, token) {
				if (err) {
					console.log(err);
				}
				var result = JSON.parse(body);

				// If token is present, refresh.
				if (token) {
					persist.write(tokenFile, token, function (err) {
						if (err) console.log(err);
					});
				}

				//console.log(JSON.stringify(result));
				return callback(result);
			});


		}

        /**
         * Sleep Summary
         * - Makes a call to the fitbit API, requesting the summary of user's sleep from last night.
         */
		service.sleepSummary = function (callback) {
			if (service.today === null) {
				return null;
			}

			today = service.getToday();

			fitbit.request({
				uri: "https://api.fitbit.com/1/user/-/sleep/date/" + today + ".json",
				method: 'GET',
			}, function (err, body, token) {
				if (err) {
					console.log(err);
				}
				var result = JSON.parse(body);

				// If token is present, refresh.
				if (token) {
					persist.write(tokenFile, token, function (err) {
						if (err) console.log(err);
					});
				}

				//console.log(JSON.stringify(result));
				return callback(result);
			});
		}

        /**
         * Device summary
         * - Makes an API call to gather the information on the devices.
         */
		service.deviceSummary = function (callback) {
			// Make an API call to get the users device status
			fitbit.request({
				uri: "https://api.fitbit.com/1/user/-/devices.json",
				method: 'GET',
			}, function (err, body, token) {
				if (err) {
					console.log(err);
				}
				var result = JSON.parse(body);

				// If the token arg is not null, then a refresh has occured and
				// we must persist the new token.
				if (token) {
					persist.write(tokenFile, token, function (err) {
						if (err) console.log(err);
					});
				}

				return callback(result);
			});
		}

		/**
		 * Lifetime summary
		 * - Makes an API call to gather the users lifetime statistics.
		 */
		service.lifetimeSummary = function (callback) {
			// Make an API call to get the users device status
			fitbit.request({
				uri: "https://api.fitbit.com/1/user/-/activities.json",
				method: 'GET',
			}, function (err, body, token) {
				if (err) {
					console.log(err);
				}
				var result = JSON.parse(body);

				// If the token arg is not null, then a refresh has occured and
				// we must persist the new token.
				if (token) {
					persist.write(tokenFile, token, function (err) {
						if (err) console.log(err);
					});
				}

				//console.log(JSON.stringify(result));
				return callback(result);
			});
		}


		/**
		 * Heart Rate
		 */
		service.heartRate = function (callback) {
			// Make an API call to get the users device status
			fitbit.request({
				uri: "https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json",
				method: 'GET',
			}, function (err, body, token) {
				if (err) {
					console.log(err);
				}
				var result = JSON.parse(body);

				// If the token arg is not null, then a refresh has occured and
				// we must persist the new token.
				if (token) {
					persist.write(tokenFile, token, function (err) {
						if (err) console.log(err);
					});
				}

				//console.log(JSON.stringify(result));
				return callback(result);
			});
		}
		//Add Alarm
		//POST https://api.fitbit.com/1/user/[user-id]/devices/tracker/[tracker-id]/alarms.json

		//Update Alarm
		//POST https://api.fitbit.com/1/user/[user-id]/devices/tracker/[tracker-id]/alarms/[alarm-id].json

		//Delete Alarm
		//DELETE https://api.fitbit.com/1/user/[user-id]/devices/tracker/[tracker-id]/alarms/[alarm-id].json

		//Heart Rate
		//https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json

		return service;
	}

	angular.module('SmartMirror')
		.factory('FitbitService', FitbitService);

} ());
