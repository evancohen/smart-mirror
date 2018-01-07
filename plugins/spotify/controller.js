function Spotify($scope, $http, SpotifyService, SpeechService, Focus, $interval) {
    
	SpotifyService.init(function () {
        refreshAllData();
        $interval(currentProfile, 3600000 * 0.5); // hours
        $interval(currentPlaying, 1000 * 10); // secs
        $interval(currentDevice, 1000 * 10); // secs
    });

	var currentProfile = function () {
		SpotifyService.profileSummary().then(function (response) {
			$scope.profile = response;
            console.log($scope.profile);
		});
	};

	var currentDevice = function () {
		SpotifyService.activeDevice().then(function (response) {
            console.debug("current device:", response);
            $scope.isPlaying = response.is_playing;
            $scope.scDevice = response.device.name || null;
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
		currentProfile();
		currentPlaying();
		currentDevice();
	};
    
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