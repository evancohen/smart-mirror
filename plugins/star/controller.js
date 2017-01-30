function Star($scope, $http, $interval, $q, TimeboxService) {
	var STAR_API = "http://api.starbusmetro.fr/api/nextdepartures/"

	var getDepartures = function () {
		var deferred = $q.defer();
		var promises = [];

		if (typeof config.star != 'undefined' && config.star.lines) {
			angular.forEach(config.star.lines, function (line) {
				if (line.hasOwnProperty('startTime') && TimeboxService.shouldDisplay(line.startTime, line.endTime)
                    || !line.hasOwnProperty('startTime')) {
					promises.push(getDeparture(line));
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

    // Request bus info
	function getDeparture(line) {
		var deferred = $q.defer();
		$http.get(getEndpoint(line)).then(function (response) {
			line.departures = null;
			for (var i = 0; i < response.data.departures.length; i++) {
				if (!line.departures) {
					line.departures = response.data.departures[i].time + "min";
				} else {
					line.departures = line.departures + ", " + response.data.departures[i].time + "min";
				}
			}
			if (!line.departures){
				line.departures = "Plus aucun passages"
			}

			deferred.resolve(line);
		}, function (error) {
            // Most of the time this is because an address can't be found
			if (error.status === 404) {
				console.error('No bus information available');
				deferred.reject('Unavailable');
			} else {
				console.error('Star error:', error.statusText);
				deferred.reject(error.statusText);
			}
		});
		return deferred.promise;
	}

    // Build the request to send
	function getEndpoint(line) {
		var endpoint = STAR_API + line.stop + "?route=" + line.line_number + "&callback=JSON_CALLBACK";
		return endpoint;
	}

	var refreshStarData = function () {
		getDepartures().then(function (lines) {
            //Todo this needs to be an array of star objects -> $lines[]
			$scope.lines = lines;
		}, function (error) {
			$scope.star = { error: error };
		});
	}

	refreshStarData()
	$interval(refreshStarData, config.star.refreshInterval * 60000 || 900000)

}

angular.module('SmartMirror')
    .controller('Star', Star);
