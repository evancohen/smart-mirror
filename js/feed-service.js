(function(annyang) {
    'use strict';

function FeedService($http) {
  var service = {};

  service.parseFeed = function(url){
      return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
  }

  return service;
}

angular.module('SmartMirror')
    .factory('FeedService', FeedService);
}(window.annyang));
