function Remote($scope, SpeechService, Focus) {

	function showRemote() {
		const interfaces = require('os').networkInterfaces()
		let addresses = []
		for (let k in interfaces) {
			for (let k2 in interfaces[k]) {
				let address = interfaces[k][k2]
				if (address.family === 'IPv4' && !address.internal) {
					addresses.push(address.address)
				}
			}
		}
		$scope.remoteText = addresses[0] + ":" + config.remote.port;
		$scope.remoteImage = "https://chart.googleapis.com/chart?cht=qr&chs=400x400&chl=http://" + $scope.remoteText;
		Focus.change("remote");
	}

	if (config.remote && config.remote.enabled) {
		SpeechService.addCommand('show_remoteQR', function () {
			showRemote()
		});
	} 
    
    // First Run
	if (config.remote.firstRun) {
		$scope.firstRun = true;
		showRemote()
	}
}

angular.module('SmartMirror')
    .controller('Remote', Remote);
