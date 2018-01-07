function Spotify($scope, $http, SpotifyService, SpeechService, Focus, $timeout) {
    
    //Initialize Spotify
	SpotifyService.init();
	
    SpotifyService.update(function (response) {
        var promise = function() {
            if (response.items[0].album.images[0].url) {
                $scope.scThumb = response.items[0].album.images[0].url.replace("-large.", "-t500x500.");
            } else {
                $scope.scThumb = 'http://i.imgur.com/8Jqd33w.jpg?1';
            }
    //                $scope.scWaveform = response[0].waveform_url;

            $scope.scTrack = response.items[0].name;
            $scope.scArtist = response.items[0].artists[0].name;
            
            SpotifyService.update();
        };
        
        $timeout(function() {
            promise();
            SpotifyService.update();
        }, 5000);
    });

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