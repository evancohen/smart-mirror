function Spotify($scope, $http, SpotifyService, SpeechService, Focus, $interval) {
    
    //Initialize Spotify
	SpotifyService.init(function () {
        refreshAllData();
        $interval(refreshProfileSummary, 3600000 * 0.5); // hours
        $interval(refreshCurrentPlaying, 1000 * 10); // secs
        $interval(refreshCurrentDevice, 1000 * 10); // secs
        
        $scope.isActive = function() {
            return SpotifyService.isActive();
        };
    });

	// Profile
	var refreshProfileSummary = function () {
		SpotifyService.profileSummary().then(function (response) {
			$scope.profile = response;
            console.log($scope.profile);
		});
	};

	// Profile
	var isPlaying = function () {
		SpotifyService.profileSummary().then(function (response) {
			$scope.profile = response;
            console.log($scope.profile);
		});
	};

	// Profile
	var refreshCurrentDevice = function () {
		SpotifyService.activeDevice().then(function (response) {
            if (response.is_playing) {
                $scope.scDevice = "Playing on " + response.device.name;
            } else {
                $scope.scDevice = response.device.name + " Standby";
            }
            console.log(response);
		});
	};

	// Profile
	var refreshCurrentPlaying = function () {
		SpotifyService.whatIsPlaying().then(function (response) {
            console.log(response);
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

	// All Data
	var refreshAllData = function () {
		refreshProfileSummary();
		refreshCurrentPlaying();
		refreshCurrentDevice();
	};

    //Spotify search and play
	SpeechService.addCommand('spotify_search_track', function (query) {
		SpotifyService.searchTrack(query).then(function (response) {
            if (response) {
                if (response.items[0].album.images[0].url) {
                    $scope.scThumb = response.items[0].album.images[0].url.replace("-large.", "-t500x500.");
                } else {
                    $scope.scThumb = 'http://i.imgur.com/8Jqd33w.jpg?1';
                }
//                $scope.scWaveform = response[0].waveform_url;
                
                $scope.scTrack = response.items[0].name;
                $scope.scArtist = response.items[0].artists[0].name;


                Focus.change("spotify");
    //			SpotifyService.play();
            } else {
                console.log('no results found');
            }
		});
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
                if (response.items[0].album.images[0].url) {
                    $scope.scThumb = response.items[0].album.images[0].url.replace("-large.", "-t500x500.");
                } else {
                    $scope.scThumb = 'http://i.imgur.com/8Jqd33w.jpg?1';
                }
//                $scope.scWaveform = response[0].waveform_url;
                
                $scope.scTrack = response.items[0].name;
                $scope.scArtist = response.items[0].artists[0].name;


                Focus.change("spotify");
    //			SpotifyService.play();
            } else {
                console.log('no results found');
            }
		});
	});
}

angular.module('SmartMirror')
    .controller('Spotify', Spotify);