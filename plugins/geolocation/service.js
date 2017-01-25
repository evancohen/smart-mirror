(function () {
	'use strict';

    /*
     var position = {
     latitude: 78.23423423,
     longitude: 13.123124142
     }
     deferred.resolve(position);
     */

	function GeolocationService($q, $rootScope, $window, $http) {
		var service = {};
		var geoloc = null;

		service.getLocation = function () {
			var deferred = $q.defer();

            // Use geo postion from config file if it is defined
			if (typeof config.geoPosition != 'undefined'
                && typeof config.geoPosition.latitude != 'undefined'
                && typeof config.geoPosition.longitude != 'undefined') {

				deferred.resolve({
					coords: {
						latitude: config.geoPosition.latitude,
						longitude: config.geoPosition.longitude,
					},
				});

			} else {
				if (geoloc !== null) {
					console.log("Cached Geolocation", geoloc);
					return (geoloc);
				}

				$http.get("https://maps.googleapis.com/maps/api/browserlocation/json?browser=chromium").then(
                    function (result) {
	var location = angular.fromJson(result).data.location
	deferred.resolve({ 'coords': { 'latitude': location.lat, 'longitude': location.lng } })
},
                    function (err) {
	console.debug("Failed to retrieve geolocation.", err)
	deferred.reject("Failed to retrieve geolocation.")
});
			}

			geoloc = deferred.promise;
			return deferred.promise;
		}

		return service;
	}

	angular.module('SmartMirror')
        .factory('GeolocationService', GeolocationService);

} ());
