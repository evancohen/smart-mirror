(function(annyang) {
    'use strict';

    function ScrobblerService($http, $q) {
      var service = {};

      service.getSongInformation = function () {
        var deferred = $q.defer();
        if (config.lastfm.user.length) {
          var url = "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user="+config.lastfm.user+"&api_key="+config.lastfm.apikey+"&limit=1&format=json";

          $http.get(url).then(function(response) {
            console.log(response);
            deferred.resolve(response.data);
          }, function(error) {
            deferred.reject('Unknown error');
          });
        }
      }

      return service;
    }

    angular.module('SmartMirror')
        .factory('ScrobblerService', ScrobblerService);
}(window.annyang));
