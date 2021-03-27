const parseString = require('xml2js').parseString;

function Dilbert($scope, $http, $q, SpeechService, Focus) {
	var dilbertFeed

	var getDilbertFeed = function () {
		var deferred = $q.defer();
		if (dilbertFeed) {
			deferred.resolve(dilbertFeed);
		}
		dilbertFeed=[]
		//$http.jsonp('http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=http://comicfeeds.chrisbenard.net/view/dilbert/default')
		$http.get('http://comicfeeds.chrisbenard.net/view/dilbert/default')
			.then(function (res) {
				parseString(res.data, {trim: true},  (err, response) =>{
					for (var entry of response.feed.entry) {
						console.log("dilbert entry="+JSON.stringify(entry))
						var x="https:"+entry.content[0]['_'].replace(/'/g, "'").match(/<img.*?src="(.*?)"/)[1]
						dilbertFeed.push({content:x, title:entry.title})	                  
					}
					//dilbertFeed = response.feed;
					deferred.resolve(dilbertFeed);
				})
			});
		return deferred.promise;
	};

	// Show Dilbert comic
	SpeechService.addCommand('image_comic_dilbert', function () {
		getDilbertFeed().then(function(feed){
			$scope.dilbert = feed[0]
			Focus.change("dilbert");
		})  
	});

}

angular.module('SmartMirror')
	.controller('Dilbert', Dilbert);