function CommitStrip($scope, $http, Focus, SpeechService) {

	var url = 'http://www.commitstrip.com/en/feed/';
	$scope.commitStrip = null;


	$http.jsonp('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%20%3D%20\'' + encodeURIComponent(url) + '\'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=JSON_CALLBACK')
		.then(function (response) {
			var encoded = response.data.query.results.rss.channel.item[0].encoded;

			var encodedElem = document.createElement('div');
			encodedElem.innerHTML = encoded;

			$scope.commitStrip = encodedElem.querySelector('img').src;
		});

	SpeechService.addCommand('image_comic_commitstrip', function () {
		Focus.change("commitstrip");
	});
}

angular.module('SmartMirror')
    .controller('CommitStrip', CommitStrip);
