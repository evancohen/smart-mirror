function Scrobbler($scope, $interval, ScrobblerService) {
	var getScrobblingTrack = function () {
		ScrobblerService.getCurrentTrack().then(
			function (track) {
				$scope.track = track;
			},
			function () {
				// Network / API errors — clear UI, avoid unhandled rejection noise
				$scope.track = null;
			}
		);
	};

	if (
		typeof config.lastfm !== "undefined" &&
		typeof config.lastfm.key !== "undefined" &&
		typeof config.lastfm.user !== "undefined"
	) {
		getScrobblingTrack();
		$interval(getScrobblingTrack, config.lastfm.refreshInterval * 60000 || 1800000);
	}
}

angular.module("SmartMirror").controller("Scrobbler", Scrobbler);
