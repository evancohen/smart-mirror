function Fitbit($scope, $interval, FitbitService, SpeechService) {
	var totalStatGroups = 4;
	$scope.currentStatGroup = 0;

	// Check if the fitbit configuration exists before initializing the service.
	if (typeof config.fitbit !== 'undefined') {
		FitbitService.init(function () {
			refreshFitbitData();			
			$interval(cycleFitbitStats, 10000); // 10 secs
			$interval(refreshTodaySummary, 1800000); // 30 mins
			$interval(refreshDeviceSummary, 3600000); // 1 hour
			$interval(refreshProfileSummary, 3600000 * 6); // 6 hours
			$interval(refreshSleepSummary, 3600000 * 6); // 6 hours
			$interval(refreshHeartRate, 3600000 * 6); // 6 hours
			$interval(refreshLifetimeSummary, 3600000 * 12); // 12 hours
		});
	}

	// Profile
	var refreshProfileSummary = function () {
		FitbitService.profileSummary(function (response) {
			$scope.profile = response;
		});
	};

	// Today
	var refreshTodaySummary = function () {
		FitbitService.todaySummary(function (response) {
			$scope.todaySummary = response;
		});
	};

	// Sleep
	var refreshSleepSummary = function () {
		FitbitService.sleepSummary(function (response) {
			$scope.sleep = response;
		});
	};

	// Device
	var refreshDeviceSummary = function () {
		FitbitService.deviceSummary(function (response) {
			$scope.devices = response;
		});
	};

	// Lifetime Statistics
	var refreshLifetimeSummary = function () {
		FitbitService.lifetimeSummary(function (response) {
			$scope.lifetimeSummary = response;
		});
	};

	// Heart Rate
	var refreshHeartRate = function () {
		FitbitService.heartRate(function (response) {
			$scope.heartRate = response;
		});
	};

	// All Data
	var refreshFitbitData = function () {
		refreshProfileSummary();
		refreshTodaySummary();
		refreshSleepSummary();
		refreshDeviceSummary();
		refreshHeartRate();
		refreshLifetimeSummary();
	};

	// Cycle Through
	var cycleFitbitStats = function () {
		$scope.currentStatGroup = ($scope.currentStatGroup + 1) % totalStatGroups;
	};

	// Refresh all stats
	// refresh some stats of specific topics?
	SpeechService.addCommand('show_my_walking', function () {
		refreshFitbitData();
	});

	var sleepEndDate = function(sleepStartDate, duration) {
		var date = new Date(sleepStartDate);
		date.setMilliseconds(date.getMilliseconds() + duration);
		return date;
	};

	var barColour = function(current, goal) {
		if (current < goal) {
			return 'white';
		}
		return 'lime';
	};

	var calculatePercent = function(current, goal) {
		if (current < goal) {
			return (100 * current/goal) + '%';
		}
		return '100%';
	};

	$scope.calculatePercent = calculatePercent;
	$scope.barColour = barColour;
	$scope.sleepEndDate = sleepEndDate;

}

angular.module('SmartMirror')
	.controller('Fitbit', Fitbit);