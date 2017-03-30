function Weather($scope, $interval, $http, GeolocationService) {

	var language = (typeof config.general.language !== 'undefined') ? config.general.language.substr(0, 2) : "en"
	var geoposition = {}
	var weather = {}

	weather.get = function () {
		return $http.jsonp('https://api.darksky.net/forecast/' + config.forecast.key + '/' +
            geoposition.coords.latitude + ',' + geoposition.coords.longitude + '?units=' +
            config.forecast.units + "&lang=" + language + "&callback=JSON_CALLBACK")
            .then(function (response) {
	return weather.forecast = response;
});
	};

	weather.minutelyForecast = function () {
		if (weather.forecast === null) {
			return null;
		}
		return weather.forecast.data.minutely;
	}

    //Returns the current forecast along with high and low tempratures for the current day
	weather.currentForecast = function () {
		if (weather.forecast === null) {
			return null;
		}
		weather.forecast.data.currently.day = moment.unix(weather.forecast.data.currently.time).format('ddd');
		weather.forecast.data.currently.temperature = parseFloat(weather.forecast.data.currently.temperature).toFixed(0);
		weather.forecast.data.currently.wi = "wi-forecast-io-" + weather.forecast.data.currently.icon;
		weather.forecast.data.currently.iconAnimation = weather.forecast.data.currently.icon;
		return weather.forecast.data.currently;
	}

	weather.weeklyForecast = function () {
		if (weather.forecast === null) {
			return null;
		}
        // Add human readable info to info
		for (var i = 0; i < weather.forecast.data.daily.data.length; i++) {
			weather.forecast.data.daily.data[i].day = moment.unix(weather.forecast.data.daily.data[i].time).format('ddd');
			weather.forecast.data.daily.data[i].temperatureMin = parseFloat(weather.forecast.data.daily.data[i].temperatureMin).toFixed(0);
			weather.forecast.data.daily.data[i].temperatureMax = parseFloat(weather.forecast.data.daily.data[i].temperatureMax).toFixed(0);
			weather.forecast.data.daily.data[i].wi = "wi-forecast-io-" + weather.forecast.data.daily.data[i].icon;
			weather.forecast.data.daily.data[i].counter = String.fromCharCode(97 + i);
			weather.forecast.data.daily.data[i].iconAnimation = weather.forecast.data.daily.data[i].icon;
		}
		return weather.forecast.data.daily;
	}

	weather.hourlyForecast = function () {
		if (weather.forecast === null) {
			return null;
		}
		weather.forecast.data.hourly.day = moment.unix(weather.forecast.data.hourly.time).format('ddd')
		return weather.forecast.data.hourly;
	}

	GeolocationService.getLocation({ enableHighAccuracy: true }).then(function (geopo) {
		geoposition = geopo;
		refreshWeatherData(geoposition);
		$interval(refreshWeatherData, config.forecast.refreshInterval * 60000 || 7200000)
	});

	function refreshWeatherData() {
		weather.get().then(function () {
			$scope.currentForecast = weather.currentForecast();
			$scope.weeklyForecast = weather.weeklyForecast();
			$scope.hourlyForecast = weather.hourlyForecast();
			$scope.minutelyForecast = weather.minutelyForecast();
		}, function (err) {
			console.error(err)
		});
	}
}

angular.module('SmartMirror')
    .controller('Weather', Weather);
