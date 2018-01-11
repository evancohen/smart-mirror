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

	var currentProfile = function () {
		SpotifyService.profileSummary().then(function (response) {
			$scope.profile = response;
            console.debug($scope.profile);
		});
	};

	var currentDevice = function () {
		SpotifyService.activeDevice().then(function (response) {
//            console.debug("current device:", response);
            
            var status = response.is_playing || false;
            var device = response.device.name || "UNKNOWN";
            
            $scope.scPlaying = (status)? true: false;
            $scope.scDevice = device.toLowerCase();
            console.debug("current device:", $scope.scDevice);
		});
	};

	var currentPlaying = function () {
		SpotifyService.whatIsPlaying().then(function (response) {
//            console.debug("current playing:", response);
            if (response.album.images[0].url) {
                $scope.scThumb = response.album.images[0].url.replace("-large.", "-t500x500.");
            } else {
                $scope.scThumb = 'http://i.imgur.com/8Jqd33w.jpg?1';
            }
    //                $scope.scWaveform = response[0].waveform_url;
            console.debug("current track:", response.name);
            $scope.scTrack = response.name;
            $scope.scArtist = response.artists[0].name;
		});
	};

	var currentStateInfo = function () {
		SpotifyService.currentState().then(function (response) {
            if (response) {
                $scope.spDevice = response.device.name || 'unknown';
                $scope.spTrack = response.item.name;
                $scope.spArtist = response.item.artists[0].name;
                $scope.spPlaying = response.is_playing || false;
//                var repeat = response.repeat_state;
//                var shuffle = response.shuffle_state;
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
        if (query === '') {
            SpotifyService.play();
        } else {
            SpotifyService.playTrack(query).then(function (response) {
                if (response) {
                    console.log("search", response);
                } else {
                    console.log('no results found');
                }
            });
        }
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
		SpotifyService.setRepeat();
	});
    
    SpeechService.addCommand('spotify_shuffle', function () {
		SpotifyService.setShuffle();
	});
}

angular.module('SmartMirror')
    .controller('Spotify', Spotify);