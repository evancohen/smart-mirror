function Weather($scope, $interval, $http, $translate,GeolocationService) {

	var language = (typeof config.general.language !== 'undefined') ? config.general.language.substr(0, 2) : "en"
	var geoposition = {}
	var weather= {}
	weather.get= {}

	weather.getCountry= function (){
		return new Promise((resolve,reject)=>{
			if(config.forecast.keytype =='Climacell'){
				if(config.forecast.units=='auto'){				
					$http.get('http://www.datasciencetoolkit.org/coordinates2politics/'+geoposition.coords.latitude.toString().substring(0,10)+','+geoposition.coords.longitude.toString().substring(0,11))
						.then ((info) =>{
							if(info.data[0].politics[0].code =='usa')
								config.forecast.units='us'
							else		
								config.forecast.units='si'	
							resolve()					
						}).catch((error)=>{
							console.log("datasciencetoolkit country from geolocation failed ="+JSON.stringify(error))
							reject();
						})
				}
				else
					resolve()	
			}	
			else { 
				// darksky, nothign to do here
				resolve()
			}
		})
	}	
	weather.get.Darksky  = function () {
		return new Promise((resolve,reject)=>{
			$http.jsonp('https://api.darksky.net/forecast/' + config.forecast.key + '/' +
          	    geoposition.coords.latitude + ',' + geoposition.coords.longitude + '?units=' +
            	config.forecast.units + "&lang=" + language + "&callback=JSON_CALLBACK")
			.then(function (response) {
				console.log("json="+JSON.stringify(response.data));
				resolve(weather.forecast = response);
			});
		})
	};
	weather.get.Climacell = function () {

		// return a promise, so the caller can wait
		return new Promise((resolve,reject)=>{	
			// list of concurrent requests
			var plist=[]
			var forecast=null
			var currently=null				
			// get realtime weather info (temp now)
			plist.push($http.get('https://api.climacell.co/v3/weather/realtime?lat=' +
				geoposition.coords.latitude.toString().substring(0,10) + '&lon=' + geoposition.coords.longitude.toString().substring(0,11) + '&unit_system=' +
				config.forecast.units + '&fields=temp%2Cprecipitation%2Cweather_code%2Ccloud_cover%2Csunrise%2Csunset%2Cvisibility%2Cwind_gust%2Cwind_speed&apikey='+config.forecast.key 
			).then(
				(response)=>{
					currently=response.data; 
				}
			).catch((error)=>{
				console.log("climacell realltime failed ="+JSON.stringify(error))
				reject();
			}
			)
			)
			// get the 10 day forecast info
			plist.push($http.get('https://api.climacell.co/v3/weather/forecast/daily?lat=' +
				geoposition.coords.latitude.toString().substring(0,10) + '&lon=' + geoposition.coords.longitude.toString().substring(0,11) + '&unit_system=' +
				config.forecast.units + '&start_time=now&fields=temp%2Cprecipitation_probability%2Cweather_code&apikey='+config.forecast.key 
			).then(
				(response)=>{
					forecast=response; 
				}
			).catch( (error)=>{
				console.log("climacell forecast failed ="+JSON.stringify(error))
				reject();
			}
			)
			)
			// wait for both above apis to complete
			Promise.all(plist).then(()=>{
				// save the total data
				weather['forecast']=forecast
				weather.forecast.data['currently']=[]	
				// set the currently
				weather.forecast.data.currently['data']=currently
				resolve(weather)
			})			
		})

	};

	weather.minutelyForecast = function () {
		if (weather.forecast === null) {
			return null;
		}
		return weather.forecast.data.minutely;
	}
	function min(a,b){
		return a>b?b:a
	}
	//Returns the current forecast along with high and low tempratures for the current day
	weather.currentForecast = function () {
		if (weather.forecast === null) {
			return null;
		}
		if(config.forecast.keytype=='Darksky'){
			weather.forecast.data.currently.day = moment.unix(weather.forecast.data.currently.time).format('ddd');
			weather.forecast.data.currently.temperature = parseFloat(weather.forecast.data.currently.temperature).toFixed(0);
			weather.forecast.data.currently.wi = "wi-forecast-io-" + weather.forecast.data.currently.icon;
			weather.forecast.data.currently.iconAnimation = weather.forecast.data.currently.icon;
		} else{
			weather.forecast.data.currently.day =  moment.utc(weather.forecast.data.currently.data.observation_time.value).format('ddd')
			weather.forecast.data.currently.temperature = parseFloat(weather.forecast.data.currently.data.temp.value).toFixed(0);
			weather.forecast.data.currently.wi = "wi-forecast-io-" + convert_conditions_to_icon( weather.forecast.data.currently.data) ;
			//weather.forecast.data.currently.iconAnimation = weather.forecast.data.currently.icon;
		}

		return weather.forecast.data.currently;
	}

	weather.weeklyForecast = function () {
		if (weather.forecast === null) {
			return null;
		}
		if(config.forecast.keytype=='Darksky'){
			// Add human readable info to info
			for (var i = 0; i < weather.forecast.data.daily.data.length; i++) {
				weather.forecast.data.daily.data[i].day = i>0?moment.unix(weather.forecast.data.daily.data[i].time).format('ddd'):$translate.instant('weather.today');
				weather.forecast.data.daily.data[i].temperatureMin = parseFloat(weather.forecast.data.daily.data[i].temperatureMin).toFixed(0);
				weather.forecast.data.daily.data[i].temperatureMax = parseFloat(weather.forecast.data.daily.data[i].temperatureMax).toFixed(0);
				weather.forecast.data.daily.data[i].wi = "wi-forecast-io-" + weather.forecast.data.daily.data[i].icon;
				weather.forecast.data.daily.data[i].counter = String.fromCharCode(97 + i);
				weather.forecast.data.daily.data[i].iconAnimation = weather.forecast.data.daily.data[i].icon;
			}			
		} else {
			// Add human readable info to info
			var datalength=min(weather.forecast.data.length,8)

			weather.forecast.data.daily={}
			weather.forecast.data.daily.data=[]		
			for (var i=0; i<datalength; i++) {
				weather.forecast.data.daily.data[i]={}
				weather.forecast.data.daily.data[i].day = i>0?moment.utc(weather.forecast.data[i].observation_time.value, 'YYYY-MM-DD').format('ddd'):$translate.instant('weather.today');
				weather.forecast.data.daily.data[i].temperatureMin = parseFloat(weather.forecast.data[i].temp[0].min.value).toFixed(0);
				weather.forecast.data.daily.data[i].temperatureMax = parseFloat(weather.forecast.data[i].temp[1].max.value).toFixed(0);
				weather.forecast.data.daily.data[i].wi = "wi-forecast-io-" + convert_conditions_to_icon(weather.forecast.data[i]) 
				weather.forecast.data.daily.data[i].counter = String.fromCharCode(97 + i);
				//weather.forecast.data.daily.data[i].iconAnimation = weather.forecast.data.daily.data[i].icon;
			}
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
		if(config.forecast.keytype.startsWith('Darksky'))
			config.forecast.keytype='Darksky'
		// map location to country for auto weather units (if needed)
		weather.getCountry().then(()=>{
			// get the weather info
			weather.get[config.forecast.keytype]().then(()=> {
				// set the current forecast info for index.html usage
				$scope.currentForecast = weather.currentForecast();
				// set the weekely forecast info for index.html usage				
				$scope.weeklyForecast = weather.weeklyForecast();
				if(config.forecast.keytype =='Darksky'){
					// we don't have hourly 
					$scope.hourlyForecast = weather.hourlyForecast();
					// or minutely anymore
					$scope.minutelyForecast = weather.minutelyForecast();
				}
			}, function (err) {
				console.error(err)
			});
		});
	}

	function convert_conditions_to_icon(data){
		var icon_name=''
		switch(data.weather_code.value){
		case 'ice_pellets_heavy':
			//wi-forecast-io-hail: hail	
			icon_name='hail'
			break;			
		case 'freezing_rain_heavy': 
		case 'freezing_rain':
		case 'freezing_rain_light':
		case 'freezing_drizzle':
		case 'ice_pellets':
		case 'ice_pellets_light':
			// wi-forecast-io-sleet: sleet	
			icon_name='sleet'		
			break;
		case 'snow_heavy':
		case 'snow': 
		case 'snow_light':			
		case 'flurries':
			//wi-forecast-io-snow: snow
			icon_name='snow'
			break;
		case 'tstorm':
			//wi-forecast-io-thunderstorm: thunderstorm
			icon_name='thunderstorm'
			break;
		case 'rain_heavy':
		case 'rain':
		case 'rain_light':

			// wi-forecast-io-rain: rain
			icon_name='rain'
			break;
		case 'fog_light':
		case 'fog':
			//wi-forecast-io-fog: fog
			icon_name='fog'
			break;
		case 'cloudy':
			//wi-forecast-io-cloudy: cloudy
			icon_name=data.weather_code.value
			break
		case 'mostly_cloudy':
		case 'partly_cloudy':
		case 'drizzle':			
			//wi-forecast-io-partly-cloudy-day: day-cloudy
			//wi-forecast-io-partly-cloudy-night: night-cloudy	
			icon_name='partly-cloudy'
			break;		
		case 'mostly_clear':
		case 'clear':
			//wi-forecast-io-clear-day: day-sunny
			//wi-forecast-io-clear-night: night-clear
			icon_name='clear'
			break;
		default:
		}
		if(icon_name == 'clear' || icon_name=='partly-cloudy'){
			if(data.sunrise !== undefined) {
				var m = moment()
				var sunrise=moment.utc(data.sunrise.value)
				var sunset=moment.utc(data.sunset.value)
				if( m.isAfter(sunrise) && m.isBefore(sunset) )
					icon_name+='-day'
				else
					icon_name+="-night"
			}
			else
				icon_name+='-day'
		}

		return icon_name;

		/* 
			wi-forecast-io-wind: strong-wind
			wi-forecast-io-tornado: tornado */		
	}
}

angular.module('SmartMirror')
	.controller('Weather', Weather);