function Customizer($scope, SpeechService, Focus) {

	if (config.customizer && config.customizer.commands.length >= 1) {
		angular.forEach(config.customizer.commands, function (command) {
			SpeechService.addRawCommand(command.utterance, function () {
				$scope.customizerHTML = command.body
				$scope.customizerHTML.getText = function(obj) {
					return obj.split("\n")
				}
				Focus.change("customizer")
			});
		});
	}
}

angular.module('SmartMirror')
    .controller('Customizer', Customizer);
