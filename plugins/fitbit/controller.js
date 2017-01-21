function Fitbit($scope, $interval, FitbitService, SpeechService) {
    var totalStatGroups = 4;
    $scope.currentStatGroup = 0;
    
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

    var cycleFitbitData = function () {
        $scope.currentStatGroup = ($scope.currentStatGroup + 1) % totalStatGroups; 
    }

    if (typeof config.fitbit !== 'undefined') {
        FitbitService.init(function(){
            refreshFitbitData();
            cycleFitbitData();
            $interval(cycleFitbitData, 10000); // Cycle the fitibt groups every 10 seconds.
            $interval(refreshFitbitData, config.fitbit.refreshInterval * 60000 || 3600000);
            
        })
    }

    SpeechService.addCommand('show_my_walking', function () {
        refreshFitbitData();
    });

}

angular.module('SmartMirror')
    .controller('Fitbit', Fitbit);