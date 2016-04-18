(function() {
    'use strict';

    function WeatherService($http) {
        var service = {};
        service.forcast = null;
        var geoloc = null;

        service.init = function(geoposition) {
            geoloc = geoposition;
            return $http.jsonp('https://api.forecast.io/forecast/'+config.forcast.key+'/'+
                    geoposition.coords.latitude+','+geoposition.coords.longitude+'?units=' +
                    config.forcast.units + "&lang="+ config.language.substr(0, 2) + "&callback=JSON_CALLBACK")
                .then(function(response) {
                    return service.forcast = response;
                });
        };

        //Returns the current forcast along with high and low tempratures for the current day 
        service.currentForcast = function() {
            if(service.forcast === null){
                return null;
            }
            service.forcast.data.currently.day = moment.unix(service.forcast.data.currently.time).format('ddd');
            service.forcast.data.currently.temperature = parseFloat(service.forcast.data.currently.temperature).toFixed(1);
            service.forcast.data.currently.wi = "wi-forecast-io-" + service.forcast.data.currently.icon;
            service.forcast.data.currently.iconAnimation = service.forcast.data.currently.icon;
            return service.forcast.data.currently;
        }

        service.weeklyForcast = function(){
            if(service.forcast === null){
                return null;
            }
            // Add human readable info to info
            for (var i = 0; i < service.forcast.data.daily.data.length; i++) {
                service.forcast.data.daily.data[i].day = moment.unix(service.forcast.data.daily.data[i].time).format('ddd');
                service.forcast.data.daily.data[i].temperatureMin = parseFloat(service.forcast.data.daily.data[i].temperatureMin).toFixed(1);
                service.forcast.data.daily.data[i].temperatureMax = parseFloat(service.forcast.data.daily.data[i].temperatureMax).toFixed(1);
                service.forcast.data.daily.data[i].wi = "wi-forecast-io-" + service.forcast.data.daily.data[i].icon;
                service.forcast.data.daily.data[i].counter = String.fromCharCode(97 + i);
                service.forcast.data.daily.data[i].iconAnimation = service.forcast.data.daily.data[i].icon;
            };
            return service.forcast.data.daily;
        }
		
        service.hourlyForcast = function() {
            if(service.forcast === null){
                return null;
            }
            service.forcast.data.hourly.day = moment.unix(service.forcast.data.hourly.time).format('ddd')
            return service.forcast.data.hourly;
        }
		
        service.refreshWeather = function(){
            return service.init(geoloc);
        }
        
        return service;
    }

    angular.module('SmartMirror')
        .factory('WeatherService', WeatherService);

}());
