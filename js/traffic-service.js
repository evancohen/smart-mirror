(function() {
    'use strict';

    function TrafficService($http, $q) {
        var service = {};
        var duration = null;

        service.getTravelDuration = function(){
          var deferred = $q.defer();
          $http.get("http://dev.virtualearth.net/REST/V1/Routes/"+
                config.traffic.mode+"?wp.0="+config.traffic.origin+
                "&wp.1="+config.traffic.destination+"&avoid=minimizeTolls&key="+
                config.traffic.key)
          .then(function(response){
            var durationTraffic = moment.duration(response.data.resourceSets[0].resources[0].travelDurationTraffic, 'seconds');
            deferred.resolve(durationTraffic);
          }, function(error) {
            if (error.status === 404) {
              console.error('No transit information available between start and end');
              deferred.reject('Unavailable');
            } else {
              console.error(error.statusText);
              deferred.reject('Unknown error');
            }
            duration = deferred.promise;
          });
          return deferred.promise;
        };

        return service;
    }

    angular.module('SmartMirror')
        .factory('TrafficService', TrafficService);

}());
