/* global SC:true */
(function () {
	'use strict';

	function SpotifyService($http) {
		var service = {};
        var SpotifyWebApi = require('spotify-web-api-node');
        var spotify = new SpotifyWebApi();
        
		service.spotifyResponse = null;

		service.init = function () {
      // If the spotify key is defined and not empty
			if (typeof config.spotify != 'undefined' && config.spotify.length) {
                
                var spotify = new SpotifyWebApi();

                spotify.setAccessToken(config.spotify.access_token);
                spotify.setRefreshToken(config.spotify.refresh_token);
            console.log(spotify);
//                spotifyApi.refreshAccessToken()
//                  .then(function(data) {
//                    console.log('The access token has been refreshed!');
//
//                    // Save the access token so that it's used in future calls
//                    spotifyApi.setAccessToken(data.body['access_token']);
//                  }, function(err) {
//                    console.log('Could not refresh access token', err);
//                  });
                
            }
		}

        service.searchSpotify = function (query) {
            // Search tracks whose name contains the query
            return spotify.searchTracks('track:' + query)
              .then(function(data) {
                console.log('Search tracks matching "' + query + '"');
                service.spotifyResponse = data.body.tracks || null;
                return service.spotifyResponse;
              }, function(err) {
                console.log('Something went wrong!', err);
              });
        };

		return service;
	}

	angular.module('SmartMirror')
    .factory('SpotifyService', SpotifyService);

} ());
