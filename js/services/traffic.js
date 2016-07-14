(function() {
    'use strict';

    function TrafficService($http, $q, TimeboxService) {
        var service = {};
        var BING_MAPS = "http://dev.virtualearth.net/REST/V1/Routes/"

        service.getDurationForTrips = function(){
            var deferred = $q.defer();
            var promises = [];

            if(typeof config.traffic != 'undefined' && config.traffic.trips != 'undefined'){                
                angular.forEach(config.traffic.trips, function(trip) {
                    if (trip.hasOwnProperty('startTime') && TimeboxService.shouldDisplay(trip.startTime, trip.endTime)
                        || !trip.hasOwnProperty('startTime')) {
                        promises.push(getTripDuration(trip));
                    }
                });

                $q.all(promises).then(function(data) {
                    deferred.resolve(data)
                });
            } else {
                deferred.reject;
            }

            return deferred.promise;
        };

        // Request traffic info for the configured mode of transport
        function getTripDuration(trip){
          var deferred = $q.defer();
          $http.get(getEndpoint(trip)).then(function(response){
            // Walking and Transit are "not effected" by traffic so we don't use their traffic duration
            if(trip.mode == "Transit" || trip.mode == "Walking"){
                trip.duration = moment.duration(response.data.resourceSets[0].resources[0].travelDuration, 'seconds');
            } else {
                trip.duration = moment.duration(response.data.resourceSets[0].resources[0].travelDurationTraffic, 'seconds')
            }

            deferred.resolve(trip);
          }, function(error) {
            // Most of the time this is because an address can't be found
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
        }

        // Depending on the mode of transport different paramaters are required.
        function getEndpoint(trip){
            var waypoints = 1;
            var intermediateGoal = "";
            if (typeof trip.via !== 'undefined' && trip.via != "") {
                waypoints = 2;
                intermediateGoal = "&wp.1=" + trip.via;
            }
            var endpoint = BING_MAPS + trip.mode + "?wp.0=" + trip.origin + intermediateGoal + "&wp."+ waypoints + "="+trip.destination;
            if(trip.mode == "Driving"){
                endpoint += "&avoid=minimizeTolls";
            } else if(trip.mode == "Transit"){
                endpoint += "&timeType=Departure&dateTime=" + moment().format('h:mm:ssa').toUpperCase();
            } else if(trip.mode == "Walking"){
                endpoint += "&optmz=distance";
            }
            endpoint += "&key=" + config.traffic.key;

            return endpoint;
        }

        return service;
    }

    angular.module('SmartMirror')
        .factory('TrafficService', ['$http', '$q', 'TimeboxService', TrafficService]);

}());
