function Fitbit($scope, $interval, FitbitService, SpeechService) {
    var refreshFitbitData = function () {
        console.log('refreshing fitbit data');
        FitbitService.profileSummary(function (response) {
            $scope.fbDailyAverage = response;
        });

        FitbitService.todaySummary(function (response) {
            $scope.fbToday = response;
        });

        FitbitService.sleepSummary(function (response) {
            $scope.fbSleep = response;
        });

        FitbitService.deviceSummary(function (response) {
            $scope.fbDevices = response;
        });
    };

    if (typeof config.fitbit !== 'undefined') {
        refreshFitbitData()
        $interval(refreshFitbitData, config.fitbit.refreshInterval * 60000 || 3600000)
    }

    SpeechService.addCommand('show_my_walking', function () {
        refreshFitbitData();
    });

}

angular.module('SmartMirror')
    .controller('Fitbit', Fitbit);