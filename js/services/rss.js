(function(annyang) {
    'use strict';

    function RssService($http, $q) {
        var service = {};
        service.feed = [];
        service.currentFeed = 0;

        service.init = function() {
            service.feed = [];
            service.currentFeed = 0;
            var currentTime = new moment();

            if (typeof config.rss != 'undefined'){
                var promises = [];
                angular.forEach(config.rss.feeds, function(url) {
                    promises.push($http.jsonp('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%20%3D%20\'' + encodeURIComponent(url) + '\'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=JSON_CALLBACK'));
                });

                return $q.all(promises).then(function(response) {
                      for (var i=0; i < response['0'].data.query.results.rss.channel.item.length; i++){
                          var feedEntry = {
                                title  : response['0'].data.query.results.rss.channel.title,
                                content: response['0'].data.query.results.rss.channel.item[i].title,
                                lastUpdated : currentTime,
                          };
                          service.feed.push(feedEntry);
                      }
                });
            }
        };

        service.refreshRssList = function() {
          return service.init().then(function(entries) {
            return entries;
          });
        };

        service.getNews = function() {
            if (service.feed == null) {
                return null;
            }
            switch (config.rss.mode) {
                case 'random':
                    service.currentFeed = Math.floor(Math.random() * service.feed.length);
                break;

                case 'sequence':
                default:
                    if (service.currentFeed == (service.feed.length-1)){
                        service.currentFeed = 0;
                    }
                    else {
                        service.currentFeed = service.currentFeed + 1;
                    }               
            };
            return service.feed[service.currentFeed];
        } ;

        return service;
    }

    angular.module('SmartMirror')
        .factory('RssService', RssService);
}(window.annyang));
