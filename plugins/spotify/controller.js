function Spotify($scope, $http, SpotifyService, SpeechService, Focus) {
    
    //Initialize Spotify
	SpotifyService.init();

    //Spotify search and play
	SpeechService.addCommand('spotify_search_track', function (query) {
		SpotifyService.searchSpotify(query).then(function (response) {
            console.log(response);
//			if (response[0].artwork_url) {
//				$scope.scThumb = response[0].artwork_url.replace("-large.", "-t500x500.");
//			} else {
//				$scope.scThumb = 'http://i.imgur.com/8Jqd33w.jpg?1';
//			}
//			$scope.scWaveform = response[0].waveform_url;
//			$scope.scTrack = response[0].title;
			Focus.change("spotify");
//			SpotifyService.play();
		});
	});
}

angular.module('SmartMirror')
    .controller('Spotify', Spotify);