function AutoSleep($http, $q, SpeechService,AutoSleepService) {


    // Hide everything and "sleep"
	SpeechService.addCommand('sleep', function () {
		console.debug("Ok, going to sleep...");
		AutoSleepService.sleep();
	});

}

angular.module('SmartMirror')
    .controller('AutoSleep', AutoSleep);