function AutoSleep($scope, $http, $q, SpeechService,AutoSleepService) {


    // Hide everything and "sleep"
    SpeechService.addCommand('sleep', function () {
        console.debug("Ok, going to sleep...");
        AutoSleepService.sleep();
        $scope.$parent.focus = AutoSleepService.scope;
    });

    $scope.$on('autoSleep.wake', function(e, value) {
        if (!AutoSleepService.woke) {
		    AutoSleepService.wake();
            $scope.$parent.focus = AutoSleepService.scope; 
	    }
	    console.debug('controller Wake');
	    AutoSleepService.stopAutoSleepTimer();
    }); 
    $scope.$on('autoSleep.sleep', function(e, value) {
        AutoSleepService.sleep();
        $scope.$parent.focus = AutoSleepService.scope; 
	    console.debug('controller sleep');
    });
}

angular.module('SmartMirror')
    .controller('AutoSleep', AutoSleep);