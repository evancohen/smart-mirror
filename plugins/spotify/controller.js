function Spotify($scope, $http, SpotifyService, SpeechService, Focus, $interval) {
    
	SpotifyService.init(function () {
		refreshAuth();
		addVoiceControl();
		currentStateInfo();
		$interval(refreshAuth, 60000 * 30); // minutes
		$interval(currentStateInfo, 1000 * config.spotify.timeout); // seconds
	});
    
	var refreshAuth = function () {
		SpotifyService.refreshToken();
	};

	var currentStateInfo = function () {
		SpotifyService.currentState().then(function (response) {
			if (response) {
				$scope.spDevice = response.device.name || 'unknown';
				$scope.spTrack = response.item.name;
				$scope.spArtist = response.item.artists[0].name;
				$scope.spPlaying = response.is_playing || false;
				$scope.spRepeat = response.repeat_state;
				$scope.spShuffle = response.shuffle_state;
				$scope.spThumb = response.item.album.images[0].url || 'http://i.imgur.com/8Jqd33w.jpg?1';
                
				$scope.spActive = true;
			} else {
				$scope.spActive = false;
			}
            
			//            console.debug("current state:", response, $scope);
		});
	};

	var addVoiceControl = function() {
		SpeechService.addCommand('spotify_play', function (query) {
			SpotifyService.playTrack(query);
		});

		SpeechService.addCommand('spotify_pause', function () {
			SpotifyService.pause();
		});

		SpeechService.addCommand('spotify_forward', function () {
			SpotifyService.skipNext();
		});

		SpeechService.addCommand('spotify_back', function () {
			SpotifyService.skipBack();
		});

		SpeechService.addCommand('spotify_repeat', function () {
			var state = ($scope.spRepeat === 'track')? 'off': 'track';
			SpotifyService.toggleRepeat(state);
		});

		SpeechService.addCommand('spotify_shuffle', function () {
			var state = ($scope.spShuffle)? false: true;
			SpotifyService.toggleShuffle(state);
		});

		SpeechService.addCommand('spotify_transfer', function (name) {
			SpotifyService.sendToDevice(name);
		});
	};
}

angular.module('SmartMirror')
	.controller('Spotify', Spotify);