function AutoSleep($scope, $http, $q, SpeechService,AutoSleepService) {


    // Hide everything and "sleep"
    SpeechService.addCommand('sleep', function () {
        console.debug("Ok, going to sleep...");
        AutoSleepService.sleep();
        $scope.$parent.focus = AutoSleepService.scope;
    });

    $scope.$on('refreshScopeFocus', function (e, value) {
        $scope.$parent.focus = value
    });

}

angular.module('SmartMirror')
    .controller('AutoSleep', AutoSleep);