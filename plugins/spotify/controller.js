function Spotify($scope, $http, SpotifyService, SpeechService, Focus, $interval) {
    
	SpotifyService.init(function () {
        refreshAllData();
        $interval(refreshAuth, 3600000 * 0.5); // hours
        $interval(currentProfile, 3600000 * 0.5); // hours
        $interval(currentPlaying, 1000 * 10); // secs
        $interval(currentDevice, 1000 * 10); // secs
    });

	var refreshAuth = function () {
		SpotifyService.refreshToken().then(function (response) {
            console.debug("session authorization renewed");
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
            console.debug("current device:", response);
            
            var status = response.is_playing || false;
            var device = response.device.name || "UNKNOWN";
            
            $scope.scPlaying = (status)? true: false;
//            $scope.scStatus = (status)? "playing": "paused";
            $scope.scDevice = device.toLowerCase();
//            $scope.scMessage = $scope.scStatus + " on " + $scope.scDevice;
//            $scope.scMessage = $scope.scStatus + " on " + $scope.scDevice;
            console.debug("current device:", $scope.scDevice);
		});
	};

	var currentPlaying = function () {
		SpotifyService.whatIsPlaying().then(function (response) {
            console.debug("current playing:", response);
            if (response.album.images[0].url) {
                $scope.scThumb = response.album.images[0].url.replace("-large.", "-t500x500.");
            } else {
                $scope.scThumb = 'http://i.imgur.com/8Jqd33w.jpg?1';
            }
    //                $scope.scWaveform = response[0].waveform_url;
            $scope.scTrack = response.name;
            $scope.scArtist = response.artists[0].name;
		});
	};

	var refreshAllData = function () {
        refreshAuth();
		currentProfile();
		currentPlaying();
		currentDevice();
	};
    
    SpeechService.addCommand('spotify_reauthorize', function () {
		SpotifyService.refreshToken();
	});
    
    SpeechService.addCommand('spotify_resume', function () {
		SpotifyService.play();
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
    
    SpeechService.addCommand('spotify_play', function (query) {
		SpotifyService.playTrack(query).then(function (response) {
            if (response) {
                console.log("search", response);
            } else {
                console.log('no results found');
            }
		});
	});
}

angular.module('SmartMirror')
    .controller('Spotify', Spotify);