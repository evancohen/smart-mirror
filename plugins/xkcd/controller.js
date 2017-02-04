function Xkcd($scope, $http, SpeechService, Focus) {

    // Show xkcd comic
	SpeechService.addCommand('image_comic', function () {
		$http.jsonp("http://dynamic.xkcd.com/api-0/jsonp/comic?callback=JSON_CALLBACK")
            .then(function (response) {
	$scope.xkcd = response.data.img;
	Focus.change("xkcd");
});
	});

}

angular.module('SmartMirror')
    .controller('Xkcd', Xkcd);