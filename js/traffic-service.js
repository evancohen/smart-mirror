(function() {
    'use strict';

    function TrafficService($http) {
        var service = {};

        service.time = "";

        service.getTravelDuration = function(){
          var promise = null;
          if (TRIP_WAY_OF_TRANSPORT === 'Driving') {
            promise = driving();
          } else if (TRIP_WAY_OF_TRANSPORT === 'Transit') {
            promise = transit();
          } else if (TRIP_WAY_OF_TRANSPORT === 'Walking') {
            promise = walking();
          }
          return promise.then(function(response){
            var duration = moment.duration(response.data.resourceSets[0].resources[0].travelDuration, 'seconds');
            var hours = Math.floor(duration.asHours());
            var mins = Math.floor(duration.asMinutes()) - hours * 60;
            var durationTraffic = moment.duration(response.data.resourceSets[0].resources[0].travelDurationTraffic, 'seconds');
            var hoursTraffic = Math.floor(durationTraffic.asHours());
            var minsTraffic = Math.floor(durationTraffic.asMinutes()) - hours * 60;
            return service.time = {
              hours: hours,
              mins: mins,
              hoursTraffic: hoursTraffic,
              minsTraffic: minsTraffic
            };
          }, function(error) {
            var message = '';
            if (error.status === 404) {
              console.error('No transit information available between start and end');
              message = 'Unavailable';
            } else {
              console.error(error.statusText);
              message = 'Unknown error';
            }
            return service.time = {
              error: message
            }
          });
        };

        var driving = function() {
          return $http.get("http://dev.virtualearth.net/REST/V1/Routes/Driving?wp.0="+START_TRIP+"&wp.1="+END_TRIP+"&avoid=minimizeTolls&key="+BING_MAPS_API_KEY);
        }

        var transit = function() {
          var current_time = moment().format('h:mm:ssa').toUpperCase();
          return $http.get("http://dev.virtualearth.net/REST/V1/Routes/Transit?wp.0="+START_TRIP+"&wp.1="+END_TRIP+"&timeType=Departure&dateTime="+current_time+"&output=json&key="+BING_MAPS_API_KEY);
        }

        var walking = function() {
          return $http.get("http://dev.virtualearth.net/REST/V1/Routes/Walking?wp.0="+START_TRIP+"&wp.1="+END_TRIP+"&optmz=distance&output=json&key="+BING_MAPS_API_KEY);
        }

        service.getCurrentTime = function() {
          return service.time;
        }

        return service;
    }

    angular.module('SmartMirror')
        .factory('TrafficService', TrafficService);

}());
