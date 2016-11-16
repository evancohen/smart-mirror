(function(annyang) {
  'use strict';

  function TVShowService($window, $http, $q) {
    var service = {};
    service.shows = []; // hold show data here

    service.init = function() {
      var promises = [];
      service.shows = [];

      // for each show in config, create http request
      angular.forEach(config.tvshows.shows, function(show) {
      promises.push($http.get('http://epguides.frecar.no/show/' + show.replace(/\s|\./g, '') + '/next/')
        .catch(function() { // if no response for a show add blank response, log error
          console.log("No response for show: " + show);
          return "";
        }));
      });

      // resolve each http request, add response to service.shows
      return $q.all(promises).then(function(response) {
            for (var i = 0; i < response.length; i++) {
                if (response[i].data != undefined) {
                  service.shows.push(response[i]);
                }
            }
      });
    };

    // call init, return entries
    service.refreshTVShows = function() {
      return service.init().then(function(entries) {
        return entries;
      });
    };

    // result of http requests
    service.getTVShows = function() {
      return service.shows;
    };

    return service;
  }

  angular.module('SmartMirror')
    .factory('TVShowService', TVShowService);
}(window.annyang));
