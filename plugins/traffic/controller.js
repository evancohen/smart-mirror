function Traffic($scope, $http, $interval, $q, TimeboxService) {
	var BING_MAPS = "http://dev.virtualearth.net/REST/V1/Routes/";
	var language = (typeof config.general.language !== 'undefined') ? config.general.language.substr(0, 2) : "en"
	var durationHumanizer = require('humanize-duration').humanizer({
		language: language,
		units: ['h', 'm'],
		round: true
	});

	var getDurationForTrips = function () {
		var deferred = $q.defer();
		var promises = [];

		if (typeof config.traffic != 'undefined' && config.traffic.key != '' && config.traffic.trips) {
			angular.forEach(config.traffic.trips, function (trip) {
				if (trip.hasOwnProperty('startTime') && TimeboxService.shouldDisplay(trip.startTime, trip.endTime)
                    || !trip.hasOwnProperty('startTime')) {
					promises.push(getTripDuration(trip));
				}
			});

			$q.all(promises).then(function (data) {
				deferred.resolve(data)
			});
		} else {
			deferred.reject;
		}

		return deferred.promise;
	};

    // Request traffic info for the configured mode of transport
	function getTripDuration(trip) {
		var deferred = $q.defer();
		$http.get(getEndpoint(trip)).then(function (response) {
            // Walking and Transit are "not effected" by traffic so we don't use their traffic duration
			if (trip.mode == "Transit" || trip.mode == "Walking") {
				trip.duration = durationHumanizer(response.data.resourceSets[0].resources[0].travelDuration * 1000);
			} else {
				trip.duration = durationHumanizer(response.data.resourceSets[0].resources[0].travelDurationTraffic * 1000);
			}

			deferred.resolve(trip);
		}, function (error) {
            // Most of the time this is because an address can't be found
			if (error.status === 404) {
				console.error('No transit information available between start and end');
				deferred.reject('Unavailable');
			} else if (error.status === 401) {
				console.error('Unauthorized. Check your traffic key.');
				deferred.reject('Unauthorized');
			} else {
				console.error('Traffic error:', error.statusText);
				deferred.reject(error.statusText);
			}
		});
		return deferred.promise;
	}

    // Depending on the mode of transport different paramaters are required.
	function getEndpoint(trip) {
		var waypoints = 1;
		var intermediateGoal = "";
		if (typeof trip.via !== 'undefined' && trip.via != "") {
			waypoints = 2;
			intermediateGoal = "&wp.1=" + trip.via;
		}
		var endpoint = BING_MAPS + trip.mode + "?wp.0=" + trip.origin + intermediateGoal + "&wp." + waypoints + "=" + trip.destination;
		if (trip.mode == "Driving") {
			endpoint += "&avoid=minimizeTolls";
		} else if (trip.mode == "Transit") {
			endpoint += "&timeType=Departure&dateTime=" + moment().lang("en").format('h:mm:ssa').toUpperCase();
		} else if (trip.mode == "Walking") {
			endpoint += "&optmz=distance";
		}
		endpoint += "&key=" + config.traffic.key;

		return endpoint;
	}

	var refreshTrafficData = function () {
		getDurationForTrips().then(function (tripsWithTraffic) {
            //Todo this needs to be an array of traffic objects -> $trips[]
			$scope.trips = tripsWithTraffic;
		}, function (error) {
			$scope.traffic = { error: error };
		});
	}

	refreshTrafficData()
	$interval(refreshTrafficData, config.traffic.refreshInterval * 60000 || 900000)

}

angular.module('SmartMirror')
    .controller('Traffic', Traffic);