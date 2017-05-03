function HADisplay($scope, $http, $interval) {

	function getHADisplays() {
		$scope.hadisplay = [];

		if (config.hadisplay && config.hadisplay.commands.length >= 1) {
			angular.forEach(config.hadisplay.commands, function (command) {

				var req = {
					method: 'POST',
					url: config.hadisplay.url + '/api/template?api_password=' + config.hadisplay.key,
				}
				try{
					req.data = JSON.parse(command.template)
				} catch(e) {
					// no data - that's fine
				}
				
				$http(req).then(function(response) { 
					console.log('Executed HA Template:', command.heading) 
					$scope.hadisplay.push(angular.fromJson('{ "result": { "heading": "' + command.heading + '", "data": "' + response.data + '" } }'));
				}, 
				function errorCallback(response) {
					console.error('HA API Call failed:', response) 
				});
			});
		}
	}
	getHADisplays();
	$interval(getHADisplays,(config.hadisplay ? config.hadisplay.refreshInterval * 60000 : 300000));
}

angular.module('SmartMirror')
    .controller('HADisplay', HADisplay);

