function Calendar($scope, $http, $interval, CalendarService) {

	var getCalendar = function(){
		CalendarService.getCalendarEvents().then(function () {
			$scope.calendar = CalendarService.getFutureEvents();
		}, function (error) {
			console.log(error);
		});
	}

	getCalendar();
	$interval(getCalendar, config.calendar.refreshInterval * 60000 || 1800000)
}

angular.module('SmartMirror')
    .controller('Calendar', Calendar);