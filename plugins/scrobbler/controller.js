function Scrobbler($scope, $interval, ScrobblerService) {

	var getScrobblingTrack = function () {
		ScrobblerService.getCurrentTrack().then(function (track) {
			$scope.track = track;
		});
	}
    
	if (typeof config.lastfm !== 'undefined' && typeof config.lastfm.key !== 'undefined' && config.lastfm.user !== 'undefined') {
		$interval(getScrobblingTrack, config.lastfm.refreshInterval * 60000 || 1800000)
	}
}

angular.module('SmartMirror')
    .controller('Scrobbler', Scrobbler);