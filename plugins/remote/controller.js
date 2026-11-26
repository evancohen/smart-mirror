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
		// draw the QR code here; Google's chart API now returns 404 for it
		const { toSVGString } = require('qrdx/core')
		const svg = toSVGString({
			value: "http://" + $scope.remoteText,
			size: 400,
			margin: 4,
			bodyPattern: "square",
			cornerEyePattern: "square",
			cornerEyeDotPattern: "square",
			shapeRendering: "crispEdges"
		})
		$scope.remoteImage = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
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
