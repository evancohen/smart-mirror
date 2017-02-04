function Dilbert($scope, $http, $q, SpeechService, Focus) {
	var dilbertFeed

	var getDilbertFeed = function () {
		var deferred = $q.defer();
		if (dilbertFeed) {
			deferred.resolve(dilbertFeed);
		}
		$http.jsonp('http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=http://rss.latunyi.com/dilbert.rss')
            .then(function (response) {
	for (var i = 0; i < response.data.responseData.feed.entries.length; i++) {
		response.data.responseData.feed.entries[i].content =
                        response.data.responseData.feed.entries[i].content.replace(/\'/g, "'").match(/<img.*?src="(.*?)"/)[1];
	}
	dilbertFeed = response.data.responseData.feed;
	deferred.resolve(dilbertFeed);
});
		return deferred.promise;
	};

    // Show Dilbert comic
	SpeechService.addCommand('image_comic_dilbert', function () {
		getDilbertFeed().then(function(feed){
			$scope.dilbert = feed.entries[0]
			Focus.change("dilbert");
		})  
	});

}

angular.module('SmartMirror')
    .controller('Dilbert', Dilbert);