(function() {
    'use strict';

    /*
     var position = {
     latitude: 78.23423423,
     longitude: 13.123124142
     }
     deferred.resolve(position);
     */

    function GeolocationService($q,$rootScope,$window,$http) {
        var service = {};
        var geoloc = null;
        var geolocation_msgs = {
        'errors.location.unsupportedBrowser':'Browser does not support location services',
        'errors.location.permissionDenied':'You have rejected access to your location',
        'errors.location.positionUnavailable':'Unable to determine your location',
        'errors.location.timeout':'Service timeout has been reached'
        }

        service.getLocation = function (opts) {
        var deferred = $q.defer();

        // Use geo postion from config file if it is defined
        if(typeof config.geoPosition != 'undefined'
            && typeof config.geoPosition.latitude != 'undefined'
            && typeof config.geoPosition.longitude != 'undefined'){

            deferred.resolve({
                coords: {
                    latitude: config.geoPosition.latitude,
                    longitude: config.geoPosition.longitude,
                },
            });

        } else {
            if(geoloc !== null){
              console.log("Cached Geolocation", geoloc);
              return(geoloc);
            }

            $http.get("http://ipinfo.io").then(
              function(ipinfo){
                var loc = angular.fromJson(ipinfo).data.loc
                var latLong = loc.split(",")
                deferred.resolve({'coords': {'latitude': latLong[0], 'longitude':latLong[1]}})
              },
              function(err) {
                console.debug("Failed to retrieve geolocation.")
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

}());
