(function() {
    'use strict';

    /*
     var position = {
     latitude: 78.23423423,
     longitude: 13.123124142
     }
     deferred.resolve(position);
     */

    function GeolocationService($q,$rootScope,$window) {
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

        }else if ($window.navigator && $window.navigator.geolocation) {
          if(geoloc !== null){
            console.log("Cached Geolocation", geoloc);
            return(geoloc);
          }
          else {
            $window.navigator.geolocation.getCurrentPosition(function(position){
                console.debug("Geoposition: " + position.coords.latitude + ", " + position.coords.longitude)
              $rootScope.$apply(function(){deferred.resolve(position);});
            }, function(error) {
              switch (error.code) {
                case 1:
                  $rootScope.$broadcast('error',geolocation_msgs['errors.location.permissionDenied']);
                  $rootScope.$apply(function() {
                    deferred.reject(geolocation_msgs['errors.location.permissionDenied']);
                  });
                  break;
                case 2:
                  $rootScope.$broadcast('error',geolocation_msgs['errors.location.positionUnavailable']);
                  $rootScope.$apply(function() {
                    deferred.reject(geolocation_msgs['errors.location.positionUnavailable']);
                  });
                  break;
                case 3:
                  $rootScope.$broadcast('error',geolocation_msgs['errors.location.timeout']);
                  $rootScope.$apply(function() {
                    deferred.reject(geolocation_msgs['errors.location.timeout']);
                  });
                  break;
              }
            }, opts);
          }
        }
        else
        {
          $rootScope.$broadcast('error',geolocation_msgs['errors.location.unsupportedBrowser']);
          $rootScope.$apply(function(){deferred.reject(geolocation_msgs['errors.location.unsupportedBrowser']);});
        }
        geoloc = deferred.promise;
        return deferred.promise;
      }

        return service;
    }

    angular.module('SmartMirror')
        .factory('GeolocationService', GeolocationService);

}());
