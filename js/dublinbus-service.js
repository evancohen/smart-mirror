(function() {
    'use strict';

    function DublinbusService($http) {
        var service = {};
        service.rawtimes = null;
        var geoloc = null;

        service.init = function() {
            return $http.get(
                'https://data.dublinked.ie/cgi-bin/rtpi/realtimebusinformation'+
                '?stopid=' + config.dublinbus.stopNumber +
                '&maxresults&operator=DublinBus'
            ).then(function (data, status, headers) {
                return service.rawtimes = data;
            });
        };

        service.currentTimes = function() {
            if(service.rawtimes === null){
                return null;
            }
            for (var i = 0; i < service.rawtimes.data.results.length; i++) {
                service.rawtimes.data.results[i].arrivaldatetime = moment.unix(service.rawtimes.data.results[i].arrivaldatetime).format('LLL');
            };
            return service.rawtimes.data.results;
        };

        return service;
    }

    angular.module('SmartMirror')
        .factory('DublinbusService', DublinbusService);

}());
