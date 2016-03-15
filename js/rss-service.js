(function(annyang) {
    'use strict';

    function RssService($http) {
        var service = {};
        service.feed = [];
        service.currentFeed = 0;

        service.init = function() {
            service.feed = [];
            service.currentFeed = 0;
            var currentTime = new moment();

            angular.forEach(config.rss.feeds, function(url) {
                $http.jsonp('http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url)).then(function(response) {
                    for (var i=0; i < response.data.responseData.feed.entries.length; i++){
                        var feedEntry = {
                            title  : response.data.responseData.feed.title,
                            content: response.data.responseData.feed.entries[i].title,
                            lastUpdated : currentTime,
                        };
                        //console.log(feedEntry);
                        service.feed.push(feedEntry);
                    }    
                });
            });
            //console.log("FEED SOURCE:", service.feedSource);
            return service.feed;
        };

        service.refreshRssList = function() {
            return service.init();
        };

        //Returns the YouTube search results for the given query
        service.getNews = function() {
            if (service.feed == null) {
                return null;
            }

            if (service.currentFeed == (service.feed.length-1)){
                service.currentFeed = 0;
            }
            else {
                service.currentFeed = service.currentFeed + 1;
            }
            return service.feed[service.currentFeed];
        } ;

        return service;
    }

    angular.module('SmartMirror')
        .factory('RssService', RssService);
}(window.annyang));
