function Greeting($scope, $http, $interval) {

	var greetingUpdater = function () {
		if (config.greeting.option == 'time') {
			var hour = moment().hour();
			var greetingTime = "midday";

			if (hour > 4 && hour < 11) {
				greetingTime = "morning";
			} else if (hour > 18 && hour < 23) {
				greetingTime = "evening";
			} else if (hour >= 23 || hour < 4) {
				greetingTime = "night";
			}
			var nextGreeting=""
			if(config.greeting[greetingTime]!==undefined){
				var nextIndex = Math.floor(Math.random() * config.greeting[greetingTime].length);
				nextGreeting = config.greeting[greetingTime][nextIndex]
			}
			else
				console.log("no greeting message specified for time='"+greetingTime+"'")
			$scope.greeting = nextGreeting;
		} else if (config.greeting.allDay) {
			$scope.greeting = config.greeting.allDay[Math.floor(Math.random() * config.greeting.allDay.length)];
		}
	};

	if (typeof config.greeting !== 'undefined') {
		greetingUpdater();
		$interval(greetingUpdater, config.calendar.refreshInterval * 60000 || 3600000)
	}
}

angular.module('SmartMirror')
	.controller('Greeting', Greeting);
