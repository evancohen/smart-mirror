(function() {
    'use strict';

    function ComicService($http) {
        var service = {};

        service.getXKCD = function(){
            return $http.jsonp("http://dynamic.xkcd.com/api-0/jsonp/comic?callback=JSON_CALLBACK").
                then(function(response){
                    return response.data;
                });
        };
        
        service.initDilbert = function(){
            return $http.jsonp('http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=http://rss.latunyi.com/dilbert.rss').
                then(function(response) {
                    for (var i=0; i<response.data.responseData.feed.entries.length; i++) {
                        response.data.responseData.feed.entries[i].content = 
                            response.data.responseData.feed.entries[i].content.replace(/\'/g, "'").match(/<img.*?src="(.*?)"/)[1];
                    } 
                    return service.dilbert = response.data.responseData.feed;
            });
        };

        service.getDilbert = function(mode){
            if (service.dilbert == null) {
                return null;
            }
            if (mode == 'random') {
            	return service.dilbert.entries[Math.floor(Math.random() * service.dilbert.entries.length)];
            }
            return service.dilbert.entries[0];
        };

        return service;
    }

    angular.module('SmartMirror')
        .factory('ComicService', ComicService);

}());
