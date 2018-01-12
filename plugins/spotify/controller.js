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
//            if ((query.indexOf('song') >= 0 && query.indexOf('song') < 5) && (query.indexOf('artist') >= 0) {
//                SpotifyService.getUserPlaylists(query).then(function (response) {
//                    console.log(response);
//                });
//            } else 
             if (query.indexOf('playlist') >= 0 && query.indexOf('playlist') < 5) {
                SpotifyService.playPlaylist(query).then(function (response) {});
            } else if (query.indexOf('album') >= 0 && query.indexOf('album') < 5) {
                SpotifyService.getAlbum(query).then(function (response) {
                    console.log(response);
                });
            } else if (query.indexOf('artist') >= 0 && query.indexOf('artist') < 5) {
                SpotifyService.getArtist(query).then(function (response) {
                    console.log(response);
                });
            } else if (query.indexOf('track') >= 0 && query.indexOf('track') < 5) {
                SpotifyService.playTrack(query).then(function (response) {});
            } else {
                SpotifyService.playTrack(query).then(function (response) {});
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
            var state = ($scope.spRepeat === 'track')? 'off': 'track';
            SpotifyService.toggleRepeat(state);
        });

        SpeechService.addCommand('spotify_shuffle', function () {
            var state = ($scope.spShuffle)? false: true;
            SpotifyService.toggleShuffle(!$scope.shuffle);
        });
    };
}

angular.module('SmartMirror')
    .controller('Spotify', Spotify);