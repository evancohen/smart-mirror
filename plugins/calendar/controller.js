function Calendar($scope, $rootScope, $http, $interval, CalendarService) {

	var getCalendar = function(){
		CalendarService.getCalendarEvents().then(function () {
			$scope.calendar=CalendarService.getFutureEvents()
<<<<<<< Updated upstream
			$rootScope.$broadcast('calendar',$scope.calendar );
=======
			if($scope.calendar)
				$rootScope.$broadcast('calendar',$scope.calendar );
>>>>>>> Stashed changes
		}, function (error) {
			console.log(error);
		});
	}

	getCalendar();
	$interval(getCalendar, config.calendar.refreshInterval * 60000 || 1800000)
}

angular.module('SmartMirror')
	.controller('Calendar', Calendar);