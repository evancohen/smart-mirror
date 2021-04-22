function Weather($scope, $interval, $http, $translate, GeolocationService) {
	var language =
		typeof config.general.language !== "undefined"
			? config.general.language.substr(0, 2)
			: "en"
	var geoposition = {}
	var weather = {}
	weather.get = {}

	weather.getCountry = function () {
		return new Promise((resolve, reject) => {
			if (config.forecast.keytype != "Darksky") {
				if (config.forecast.units == "auto") {
					$http
						.get(
							"http://www.datasciencetoolkit.org/coordinates2politics/" +
								geoposition.coords.latitude.toString().substring(0, 10) +
								"," +
								geoposition.coords.longitude.toString().substring(0, 11)
						)
						.then((info) => {
							if (info.data[0].politics[0].code == "usa")
								config.forecast.units = "us"
							else config.forecast.units = "si"
							resolve()
						})
						.catch((error) => {
							console.log(
								"datasciencetoolkit country from geolocation failed =" +
									JSON.stringify(error)
							)
							reject()
						})
				} else resolve()
			} else {
				// darksky, nothign to do here
				resolve()
			}
		})
	}
	weather.get.Openweather = function () {
		return new Promise((resolve, reject) => {
			//$http.get("https://api.openweathermap.org/data/2.5/onecall?lat=30.4548443&lon=-97.6222674&appid=a6bf9feaa86bc2677df1e5f46bd79d55")
			$http
				.get(
					"https://api.openweathermap.org/data/2.5/onecall?lat=" +
						geoposition.coords.latitude.toString().substring(0, 10) +
						"&lon=" +
						geoposition.coords.longitude.toString().substring(0, 11) +
						"&units=" +
						(config.forecast.units == "us" ? "imperial" : "metric") +
						"&appid=" +
						config.forecast.key
				)
				.then(function (response) {
					//console.log("json="+JSON.stringify(response.data));
					resolve((weather.forecast = response))
				})
				.catch(() => {
					reject()
				})
		})
	}
	weather.get.Darksky = function () {
		return new Promise((resolve, reject) => {
			$http
				.jsonp(
					"https://api.darksky.net/forecast/" +
						config.forecast.key +
						"/" +
						geoposition.coords.latitude +
						"," +
						geoposition.coords.longitude +
						"?units=" +
						config.forecast.units +
						"&lang=" +
						language +
						"&callback=JSON_CALLBACK"
				)
				.then(function (response) {
					//console.log("json="+JSON.stringify(response.data));
					resolve((weather.forecast = response))
				})
				.catch(() => {
					reject()
				})
		})

	}
	weather.get.Climacell = function () {
		// return a promise, so the caller can wait
		return new Promise((resolve, reject) => {
			// list of concurrent requests
			var plist = []
			var forecast = null
			var currently = null
			// "https://data.climacell.co/v4/timelines?timesteps=1h&units=" + this.config.tempUnits + "&location=" + this.config.lat + "," + this.config.lon + "&fields=temperature,temperatureApparent,precipitationType,humidity,windSpeed,windDirection,weatherCode&apikey=" + this.config.apiKey
			plist.push(
				$http
					.get(
						/* 'https://api.climacell.co/v3/weather/realtime?lat=' +
				geoposition.coords.latitude.toString().substring(0,10) + '&lon=' + geoposition.coords.longitude.toString().substring(0,11) + '&unit_system=' +
				config.forecast.units + '&fields=temp%2Cprecipitation%2Cweather_code%2Ccloud_cover%2Csunrise%2Csunset%2Cvisibility%2Cwind_gust%2Cwind_speed&apikey='+config.forecast.key  */
						"https://data.climacell.co/v4/timelines?timesteps=1h" +
							"&units=" +
							"metric" + //config.forecast.units +
							"&location=" +
							geoposition.coords.latitude.toString().substring(0, 10) +
							"," +
							geoposition.coords.longitude.toString().substring(0, 11) +
							"&fields=temperature,temperatureApparent,precipitationType,humidity,windSpeed,windDirection,weatherCode" +
							"&apikey=" +
							config.forecast.key
					)
					.then((response) => {
						currently = response.data.data
					})
					.catch((error) => {
						console.log("climacell realltime failed =" + JSON.stringify(error))
						reject()
					})
			)
			// get the 10 day forecast info
			plist.push(
				$http
					.get(
						"https://data.climacell.co/v4/timelines?timesteps=1d" +
							"&location=" +
							geoposition.coords.latitude.toString().substring(0, 10) +
							"," +
							geoposition.coords.longitude.toString().substring(0, 11) +
							"&units=" +
							"metric" + //	config.forecast.units +
							"&fields=temperatureMax,temperatureMin,precipitationType,weatherCode" +
							"&apikey=" +
							config.forecast.key
					)
					.then((response) => {
						forecast = response.data.data
					})
					.catch((error) => {
						console.log("climacell forecast failed =" + JSON.stringify(error))
						reject()
					})
			)

			// wait for both above apis to complete
			Promise.all(plist).then(() => {
				// save the total data
				weather["forecast"] = forecast
				weather.forecast.data = {}
				weather.forecast.data["currently"] = []
				// set the currently
				weather.forecast.data.currently["data"] = currently
				resolve(weather)
			})
		})
	}

	weather.minutelyForecast = function () {
		if (weather.forecast === null) {
			return null
		}
		return weather.forecast.data.minutely
	}
	function min(a, b) {
		return a > b ? b : a
	}
	function cvttof(temp, units) {
		let r = temp
		if (units == "us") {
			r = (r * 9) / 5 + 32
		}
		return r
	}
	function cvttof(temp, units){
		let r= temp
		if (units == 'us'){
			r= ((r*9)/5)+32
		}
		return r
	}
	//Returns the current forecast along with high and low tempratures for the current day
	weather.currentForecast = function () {
		if (weather.forecast === null) {
			return null
		}
		let ctemp = 0
		switch (config.forecast.keytype) {
			case "Darksky":
				weather.forecast.data.currently.day = moment
					.unix(weather.forecast.data.currently.time)
					.format("ddd")
				weather.forecast.data.currently.temperature = parseFloat(
					weather.forecast.data.currently.temperature
				).toFixed(0)
				weather.forecast.data.currently.wi =
					"wi-forecast-io-" + weather.forecast.data.currently.icon
				weather.forecast.data.currently.iconAnimation =
					weather.forecast.data.currently.icon
				break
			case "Climacell":
				ctemp = cvttof(
					weather.forecast.data.currently.data.timelines[0].intervals[0].values
						.temperature,
					config.forecast.units
				)
				weather.forecast.data.currently.day = moment
					.utc(weather.forecast.data.currently.data.timelines[0].startTime)
					.format("ddd")
				weather.forecast.data.currently.temperature = parseFloat(ctemp).toFixed(
					0
				)
				weather.forecast.data.currently.wi =
					"wi-forecast-io-" +
					convert_conditions_to_icon(
						weather.forecast.data.currently.data.timelines[0].intervals[0]
							.values.weatherCode,
						null,
						null,
						"utc"
					)
				break
			case "Openweather":
				weather.forecast.data["currently"] = {}
				weather.forecast.data.currently.day = moment
					.utc(weather.forecast.data.current.dt)
					.format("ddd")
				weather.forecast.data.currently.temperature = parseFloat(
					weather.forecast.data.current.temp
				).toFixed(0)
				weather.forecast.data.currently.wi =
					"wi-forecast-io-" +
					convert_conditions_to_icon(
						weather.forecast.data.current.weather["0"].description,
						weather.forecast.data.current.sunrise,
						weather.forecast.data.current.sunset,
						"unix"
					)
				break
			//weather.forecast.data.currently.iconAnimation = weather.forecast.data.currently.icon;
		}

		return weather.forecast.data.currently
	}

	weather.weeklyForecast = function () {
		if (weather.forecast === null) {
			return null
		}
		var i = 0
		var datalength = 0
		switch (config.forecast.keytype) {
			case "Darksky":
				// Add human readable info to info
				for (i = 0; i < weather.forecast.data.daily.data.length; i++) {
					weather.forecast.data.daily.data[i].day =
						i > 0
							? moment
									.unix(weather.forecast.data.daily.data[i].time)
									.format("ddd")
							: $translate.instant("forecast.today")
					weather.forecast.data.daily.data[i].temperatureMin = parseFloat(
						weather.forecast.data.daily.data[i].temperatureMin
					).toFixed(0)
					weather.forecast.data.daily.data[i].temperatureMax = parseFloat(
						weather.forecast.data.daily.data[i].temperatureMax
					).toFixed(0)
					weather.forecast.data.daily.data[i].wi =
						"wi-forecast-io-" + weather.forecast.data.daily.data[i].icon
					weather.forecast.data.daily.data[i].counter = String.fromCharCode(
						97 + i
					)
					weather.forecast.data.daily.data[i].iconAnimation =
						weather.forecast.data.daily.data[i].icon
				}
				break
			case "Climacell":
				// Add human readable info to info
				datalength = min(weather.forecast.timelines[0].intervals.length, 8)

				weather.forecast.data.daily = {}
				weather.forecast.data.daily.data = []
				for (i = 0; i < datalength; i++) {
					weather.forecast.data.daily.data[i] = {}
					weather.forecast.data.daily.data[i].day =
						i > 0
							? moment
									.utc(
										weather.forecast.timelines[0].intervals[i].startTime,
										"YYYY-MM-DD"
									)
									.format("ddd")
							: $translate.instant("forecast.today")
					weather.forecast.data.daily.data[i].temperatureMin = parseFloat(
						cvttof(
							weather.forecast.timelines[0].intervals[i].values.temperatureMin,
							config.forecast.units
						)
					).toFixed(0)
					weather.forecast.data.daily.data[i].temperatureMax = parseFloat(
						cvttof(
							weather.forecast.timelines[0].intervals[i].values.temperatureMax,
							config.forecast.units
						)
					).toFixed(0)
					weather.forecast.data.daily.data[i].wi =
						"wi-forecast-io-" +
						convert_conditions_to_icon(
							weather.forecast.timelines[0].intervals[i].values.weatherCode,
							null,
							null,
							"utc"
						)
					weather.forecast.data.daily.data[i].counter = String.fromCharCode(
						97 + i
					)
					//weather.forecast.data.daily.data[i].iconAnimation = weather.forecast.data.daily.data[i].icon;
				}
				break
			case "Openweather":
				datalength = min(weather.forecast.data.daily.length, 8)

				//weather.forecast.data.daily={}
				weather.forecast.data.daily.data = []
				for (i = 0; i < datalength; i++) {
					weather.forecast.data.daily.data[i] = {}
					weather.forecast.data.daily.data[i].day =
						i > 0
							? moment.unix(weather.forecast.data.daily[i].dt).format("ddd")
							: $translate.instant("forecast.today")
					weather.forecast.data.daily.data[i].temperatureMin = parseFloat(
						weather.forecast.data.daily[i].temp.min
					).toFixed(0)
					weather.forecast.data.daily.data[i].temperatureMax = parseFloat(
						weather.forecast.data.daily[i].temp.max
					).toFixed(0)
					weather.forecast.data.daily.data[i].wi =
						"wi-forecast-io-" +
						convert_conditions_to_icon(
							weather.forecast.data.daily[i].weather[0].description,
							weather.forecast.data.daily[i].sunrise,
							weather.forecast.data.daily[i].sunset,
							"unix"
						)
					weather.forecast.data.daily.data[i].counter = String.fromCharCode(
						97 + i
					)
				}
				break
		}
		return weather.forecast.data.daily
	}

	weather.hourlyForecast = function () {
		if (weather.forecast === null) {
			return null
		}
		switch (config.forecast.keytype) {
			case "Darksky":
				weather.forecast.data.hourly.day = moment
					.unix(weather.forecast.data.hourly.data[0].time)
					.format("ddd")
				break
			default:
				weather.forecast.data.hourly.day = moment
					.unix(weather.forecast.data.hourly[0].dt)
					.format("ddd")
		}
		return weather.forecast.data.hourly
	}

	GeolocationService.getLocation({ enableHighAccuracy: true }).then(function (
		geopo
	) {
		geoposition = geopo
		refreshWeatherData(geoposition)
		$interval(
			refreshWeatherData,
			config.forecast.refreshInterval * 60000 || 7200000
		)
	})

	function refreshWeatherData() {
		config.forecast.keytype = (config.forecast.keytype + " ").split(" ")[0]
		config.forecast.key = config.forecast.key.trim()
		// map location to country for auto weather units (if needed)
		weather.getCountry().then(() => {
			// get the weather info
			weather.get[config.forecast.keytype]().then(
				() => {
					// set the current forecast info for index.html usage
					$scope.currentForecast = weather.currentForecast()
					// set the weekely forecast info for index.html usage
					$scope.weeklyForecast = weather.weeklyForecast()
					if (config.forecast.keytype != "Climacell") {
						// we don't have hourly
						$scope.hourlyForecast = weather.hourlyForecast()
						if (config.forecast.keytype == "Darksky") {
							// or minutely anymore
							$scope.minutelyForecast = weather.minutelyForecast()
						}
					}
				},
				function (err) {
					console.error(err)
				}
			)
		})
	}

	function convert_conditions_to_icon(value, sunrise, sunset, type) {
		var icon_name = ""
		switch (value) {
			case "ice_pellets_heavy":
			case 7202:
				//wi-forecast-io-hail: hail
				icon_name = "hail"
				break
			case "freezing_rain_heavy":
			case 6201:
			case "freezing_rain":
			case 6001:
			case "freezing_rain_light":
			case 6200:
			case "freezing_drizzle":
			case 6000:
			case "ice_pellets":
			case 7000:
			case "ice_pellets_light":
			case 7201:
				// wi-forecast-io-sleet: sleet
				icon_name = "sleet"
				break
			case "snow_heavy":
			case 5101:
			case "snow":
			case 5000:
			case "snow_light":
			case 5100:
			case "flurries":
			case 5001:
				//wi-forecast-io-snow: snow
				icon_name = "snow"
				break
			case "tstorm":
			case 8000:
				//wi-forecast-io-thunderstorm: thunderstorm
				icon_name = "thunderstorm"
				break
			case "rain_heavy":
			case 4201:
			case "rain":
			case 4001:
			case "rain_light":
			case 4200:
			case "very heavy rain":
			case "heavy intensity rain":
			case "light rain":
			case "moderate rain":
				// wi-forecast-io-rain: rain
				icon_name = "rain"
				break
			case "fog_light":
			case "fog":
			case 2000:
			case 2100:
				//wi-forecast-io-fog: fog
				icon_name = "fog"
				break
			case "cloudy":
			case "overcast clouds":
				//wi-forecast-io-cloudy: cloudy
				icon_name = "cloudy"
				break
			case "mostly_cloudy":
			case "partly_cloudy":
			case 1101:
			case 1102:
			case "scattered clouds":
			case "broken clouds":
			case "drizzle":
			case 4000:
				//wi-forecast-io-partly-cloudy-day: day-cloudy
				//wi-forecast-io-partly-cloudy-night: night-cloudy
				icon_name = "partly-cloudy"
				break
			case "mostly_clear":
			case 1100:
			case "clear sky":
			case "few clouds":
			case "clear":
			case 1000:
				//wi-forecast-io-clear-day: day-sunny
				//wi-forecast-io-clear-night: night-clear
				icon_name = "clear"
				break
			default:
		}
		if (icon_name == "clear" || icon_name == "partly-cloudy") {
			if (sunrise !== undefined && sunrise !== null) {
				var m = moment()
				var sunrise_moment = null
				var sunset_moment = null
				if (type == "unix") {
					sunrise_moment = moment.unix(sunrise)
					sunset_moment = moment.unix(sunset)
				} else {
					sunrise_moment = moment.utc(sunrise)
					sunset_moment = moment.utc(sunset)
				}
				if (m.isAfter(sunrise_moment) && m.isBefore(sunset_moment))
					icon_name += "-day"
				else icon_name += "-night"
			} else icon_name += "-day"
		}

		return icon_name

		/*
			wi-forecast-io-wind: strong-wind
			wi-forecast-io-tornado: tornado */
	}
}

angular.module("SmartMirror").controller("Weather", Weather)
