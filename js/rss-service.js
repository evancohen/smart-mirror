(function() {
    'use strict';

    function RssService($http) {
        var service = {
            feed: []
        };
        
        service.callRss = function(rssUrl){
            service.feed = [];
            return $http.jsonp('http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + rssUrl).
                then(function(response) {
                    for (var i=0; i < response.data.responseData.feed.entries.length; i++) {
                        var feedEntry = {
                            author: response.data.responseData.feed.entries[i].author,
                            title: response.data.responseData.feed.entries[i].title,
                            content: response.data.responseData.feed.entries[i].content,
                            date: moment(response.data.responseData.feed.entries[i].publishedDate).format(config.dateFormat.dateTime)
                        };
                        console.log(feedEntry);

                        service.feed.push(feedEntry);
                    } 
                    return service;
            });
        };

        service.getEntrys = function(size){
            if (service.feed == null) {
                return [];
            }
            return service.feed.slice(0, size);
        };

        return service;
    }

    angular.module('SmartMirror')
        .factory('RssService', RssService);

}());
