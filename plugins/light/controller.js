// this is our controller to angular
angular
	.module("SmartMirror")
	.controller("lights", function (
		$scope,
		SpeechService,
		LightService,
		$translate
	) {
		// Control light
		SpeechService.addCommand("light_action", function (
			state,
			target,
			action
		) {
			LightService.performUpdate([state, target, action].join(" "));
		});
	});
