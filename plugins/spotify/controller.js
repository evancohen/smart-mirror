function Spotify($scope, $http, SpotifyService, SpeechService, Focus, $interval) {
    
	SpotifyService.init(function () {
        refreshAllData();
        $interval(refreshAuth, 60000 * 30); // minutes
//        $interval(currentPlaying, 1000 * config.spotify.timeout); // seconds
//        $interval(currentDevice, 1000 * config.spotify.timeout); // seconds
        $interval(currentStateInfo, 1000 * config.spotify.timeout); // seconds
    });
//TODO: make all parts on return from init
	var refreshAuth = function () {
		SpotifyService.refreshToken().then(function (response) {
            console.debug("session authorization renewed", response);
		});
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

	var refreshAllData = function () {
        refreshAuth();
//		currentPlaying();
//		currentDevice();
		currentStateInfo();
	};
    
    SpeechService.addCommand('spotify_play', function (query) {
        SpotifyService.playTrack(query).then(function (response) {
            console.log("play:", response);
        });
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
		SpotifyService.toggleShuffle(!$scope.shuffle);
	});
}

angular.module('SmartMirror')
    .controller('Spotify', Spotify);