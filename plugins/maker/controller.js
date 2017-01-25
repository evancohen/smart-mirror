function Maker($http, SpeechService) {

	if (config.maker && config.maker.commands.length >= 1) {
		angular.forEach(config.maker.commands, function (command) {
			SpeechService.addRawCommand(command.utterance, function () {
				var req = {
					method: command.method,
					url: command.url,
				}
				try{
					req.data = JSON.parse(command.body)
				} catch(e){
                    // no data - that's fine
				}
				$http(req).then(function successCallback() {
					console.log('Executed custom command:', command.utterance)
				}, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
					console.error('Custom command failed:', response)
				});
			});
		});
	}
}

angular.module('SmartMirror')
    .controller('Maker', Maker);
