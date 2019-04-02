function CommitStrip($scope, $http, Focus, SpeechService) {
	let Parser = require('rss-parser');
	var url = 'http://www.commitstrip.com/en/feed/';
	$scope.commitStrip = null;

	let parser = new Parser();
	parser.parseURL(url)
		.then(function (response) {
			var encoded = response.items[0]["content:encoded"];

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
