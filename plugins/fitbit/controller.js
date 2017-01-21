function Fitbit($scope, $interval, FitbitService, SpeechService) {
    var totalStatGroups = 4;
    $scope.currentStatGroup = 0;

    // Check if the fitbit configuration exists before initializing the service.
    if (typeof config.fitbit !== 'undefined') {
        FitbitService.init(function () {
            refreshFitbitData();
            cycleFitbitStats();
            
            $interval(cycleFitbitStats, 10000); // 10 secs
            $interval(refreshTodaySummary, 1800000); // 30 mins
            $interval(refreshDeviceSummary, 3600000); // 1 hour
            $interval(refreshProfileSummary, 3600000 * 6); // 6 hours
            $interval(refreshSleepSummary, 3600000 * 6); // 6 hours
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
            $scope.fbToday = response;
        });
    };

    // Sleep
    var refreshSleepSummary = function () {
         FitbitService.sleepSummary(function (response) {
            $scope.fbSleep = response;
        });
    };

    // Device
    var refreshDeviceSummary = function () {
        FitbitService.deviceSummary(function (response) {
            $scope.fbDevices = response;
        });
    };

    // All Data
    var refreshFitbitData = function () {
      refreshProfileSummary();
      refreshTodaySummary();
      refreshSleepSummary();
      refreshDeviceSummary();
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

}

angular.module('SmartMirror')
    .controller('Fitbit', Fitbit);