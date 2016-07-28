(function(annyang) {
    'use strict';

    function ScrobblerService($http, $q) {
      var service = {};

      service.getCurrentTrack = function () {
        var deferred = $q.defer();
        if (config.lastfm.user && config.lastfm.key) {
          var url = "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user="+config.lastfm.user+"&api_key="+config.lastfm.key+"&limit=1&format=json";

          $http.get(url).then(function(response) {
            if (response.data.error){
              // If there is an error with the request (excluding network errors)
              console.log("Scrobbler Error: ", response.data.message);
              deferred.reject(response);
            } else if (typeof response.data.recenttracks.track[0]["@attr"] == "object"){
              // If there is a track currently playing
              var track  = response.data.recenttracks.track[0];
              deferred.resolve({
                title: track.name,
                artist: track.artist["#text"] || "Unknown",
                album: track.album["#text"] || "",
                cover: track.image[1]["#text"],
              });
            } else {
              // Either there was a network error or there is no song currently playing
              deferred.reject(response);
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
