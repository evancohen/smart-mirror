(function(annyang) {
    'use strict';

    function ScrobblerService($http, $q) {
      var service = {};

      service.getSongInformation = function () {
        var deferred = $q.defer();
        var songInformation = {};
        if (config.lastfm.user.length) {
          var url = "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user="+config.lastfm.user+"&api_key="+config.lastfm.apikey+"&limit=1&format=json";

          $http.get(url).then(function(response) {
            var data = response.data;

            var information;
            if (data.recenttracks.track[0]) {
              information = data.recenttracks.track[0];
            } else {
              information = data.recenttracks.track;
            };
            var playing = false;
            if (data["@attr"]) {
              playing = data["@attr"].nowplaying;
            };
            if (typeof information.artist !== 'undefined') {
              songInformation = {
                title: information.name,
                artist: information.artist["#text"],
                album: information.album["#text"],
                cover: information.image[2]["#text"],
                playing: playing
              };
              deferred.resolve(songInformation);
            }
          });
        }
        return deferred.promise;
      }

      return service;
    }

    angular.module('SmartMirror')
        .factory('ScrobblerService', ScrobblerService);
}(window.annyang));
