(function() {
    'use strict';

    function WeatherService($http) {
        var service = {};
        service.forecast = null;
        var geoloc = null;

        service.init = function(geoposition) {
            geoloc = geoposition;
            var language = (typeof config.language !== 'undefined')?config.language.substr(0, 2) : "en"
            return $http.jsonp('https://api.forecast.io/forecast/'+config.forecast.key+'/'+
                    geoposition.coords.latitude+','+geoposition.coords.longitude+'?units=' +
                    config.forecast.units + "&lang=" + language + "&callback=JSON_CALLBACK")
                .then(function(response) {
                    return service.forecast = response;
                });
        };

        service.minutelyForecast = function(){
            if(service.forecast === null){
                return null;
            }
            return service.forecast.data.minutely;
        }

        //Returns the current forecast along with high and low tempratures for the current day
        service.currentForecast = function() {
            if(service.forecast === null){
                return null;
            }
            service.forecast.data.currently.day = moment.unix(service.forecast.data.currently.time).format('ddd');
            service.forecast.data.currently.temperature = parseFloat(service.forecast.data.currently.temperature).toFixed(0);
            service.forecast.data.currently.wi = "wi-forecast-io-" + service.forecast.data.currently.icon;
            service.forecast.data.currently.iconAnimation = service.forecast.data.currently.icon;
            return service.forecast.data.currently;
        }

        service.weeklyForecast = function(){
            if(service.forecast === null){
                return null;
            }
            // Add human readable info to info
            for (var i = 0; i < service.forecast.data.daily.data.length; i++) {
                service.forecast.data.daily.data[i].day = moment.unix(service.forecast.data.daily.data[i].time).format('ddd');
                service.forecast.data.daily.data[i].temperatureMin = parseFloat(service.forecast.data.daily.data[i].temperatureMin).toFixed(0);
                service.forecast.data.daily.data[i].temperatureMax = parseFloat(service.forecast.data.daily.data[i].temperatureMax).toFixed(0);
                service.forecast.data.daily.data[i].wi = "wi-forecast-io-" + service.forecast.data.daily.data[i].icon;
                service.forecast.data.daily.data[i].counter = String.fromCharCode(97 + i);
                service.forecast.data.daily.data[i].iconAnimation = service.forecast.data.daily.data[i].icon;
            };
            return service.forecast.data.daily;
        }
		
        service.hourlyForecast = function() {
            if(service.forecast === null){
                return null;
            }
            service.forecast.data.hourly.day = moment.unix(service.forecast.data.hourly.time).format('ddd')
            return service.forecast.data.hourly;
        }
		
        service.refreshWeather = function(){
            return service.init(geoloc);
        }
        
        return service;
    }

    angular.module('SmartMirror')
        .factory('WeatherService', WeatherService);

}());
