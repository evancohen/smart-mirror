function Giphy($scope, $http, SpeechService, Focus) {

    //Show giphy image
	SpeechService.addCommand('image_giphy', function (img) {
		$http.get("http://api.giphy.com/v1/gifs/random?api_key=" + config.giphy.key + "&tag=" + img)
            .then(function (response) {
	$scope.gifimg = response.data.data.image_url;
	Focus.change("gif");
})
	});
}

angular.module('SmartMirror')
    .controller('Giphy', Giphy);
