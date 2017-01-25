function Rss($scope, $http, $q, $interval) {

	$scope.currentIndex = 0;
	var rss = {};
	rss.feed = [];

	rss.get = function () {
		rss.feed = [];
		rss.updated = new moment().format('MMM DD, h:mm a');

		if (typeof config.rss != 'undefined' && typeof config.rss.feeds != 'undefined') {
			var promises = [];
			angular.forEach(config.rss.feeds, function (url) {
				promises.push($http.jsonp('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%20%3D%20\'' + encodeURIComponent(url) + '\'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=JSON_CALLBACK'));
			});

			return $q.all(promises)
		}
	};

	var refreshNews = function () {
		$scope.news = null;
		rss.get().then(function (response) {
            //For each feed
			for (var i = 0; i < response.length; i++) {
				for (var j = 0; j < response[i].data.query.results.rss.channel.item.length; j++) {
					var feedEntry = {
						title: response[i].data.query.results.rss.channel.item[j].title,
                        //content: response[i].data.query.results.rss.channel.item[j].description[0],
					};
					rss.feed.push(feedEntry);
				}
			}
			$scope.currentIndex = 0;
			$scope.rss = rss;
		});
	};

	var cycleNews = function(){
		$scope.currentIndex = ($scope.currentIndex >= $scope.rss.feed.length)? 0: $scope.currentIndex + 1;
	}

	if (typeof config.rss !== 'undefined' && typeof config.rss.feeds != 'undefined') {
		refreshNews();
		$interval(refreshNews, config.rss.refreshInterval * 60000 || 1800000)
		$interval(cycleNews, 8000)
	}
}


angular.module('SmartMirror')
    .controller('Rss', Rss);