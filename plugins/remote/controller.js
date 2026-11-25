function Remote($scope, SpeechService, Focus) {
	let qrCode = null

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
		const remoteUrl = "http://" + $scope.remoteText
		if (qrCode) {
			qrCode.update({ value: remoteUrl })
		} else {
			const { createQRCode } = require('qrdx/vanilla')
			qrCode = createQRCode(document.querySelector('.qrImage'), {
				value: remoteUrl,
				size: 400,
				margin: 4,
				bodyPattern: 'square',
				cornerEyePattern: 'square',
				cornerEyeDotPattern: 'square'
			})
		}
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
