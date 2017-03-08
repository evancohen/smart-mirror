function Calendar($scope, $http, $interval, CalendarService) {

	var getCalendar = function() {
		if(typeof config.calendar.icals != 'undefined') {
			// clear the events list
			events = [];
			// get the events from the calendars
			CalendarService.getCalendarEvents(config.calendar.icals,events).then(function() {
				// get the ones in scope (date range, and number of entries)	
				$scope.calendar = CalendarService.getFutureEvents(events,config.calendar.maxDays,config.calendar.maxResults);
			}, function(error) {
				console.log(error);
			});
		}
		else
		{
			console.log("No iCals defined");
		}
	};

	getCalendar();
	$interval(getCalendar, config.calendar.refreshInterval * 60000 || 1800000)
}

angular.module('SmartMirror')
    .controller('Calendar', Calendar);