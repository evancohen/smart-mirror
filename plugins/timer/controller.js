function Timer($scope, TimerService, SpeechService, Focus) {

    // Start timer
	SpeechService.addCommand('timer_start', function (duration) {
		console.debug("Starting timer");
		Focus.change("timer");
		$scope.timer = TimerService;
		TimerService.start(duration);

		$scope.$watch('timer.countdown', function (countdown) {
			if (countdown === 0) {
				TimerService.stop();
                // defaultView();
			}
		});
	});

    // Show timer
	SpeechService.addCommand('timer_show', function () {
		if (TimerService.running) {
            // Update animation
			if (TimerService.paused) {
				TimerService.start();
				TimerService.stop();
			} else {
				TimerService.start();
			}

			Focus.change("timer");
		}
	});

    // Stop timer
	SpeechService.addCommand('timer_stop', function () {
		if (TimerService.running && !TimerService.paused) {
			TimerService.stop();
		}
	});

    // Resume timer
	SpeechService.addCommand('timer_resume', function () {
		if (TimerService.running && TimerService.paused) {
			TimerService.start();
			Focus.change("timer");
		}
	});

}


angular.module('SmartMirror')
    .controller('Timer', Timer);

