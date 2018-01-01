/* global SC:true */
(function () {
	'use strict';

	function SpotifyService($http) {
		var service = {};
        var SpotifyWebApi = require('spotify-web-api-node');
        var spotify = {};
        
		service.spotifyResponse = null;

		service.init = function () {
      // If the spotify key is defined and not empty
//			if (typeof config.spotify != 'undefined' && config.spotify.length) {
                spotify = new SpotifyWebApi({
                    clientId : 'bd604371889f45739b2f684663c6eca1',//config.spotify.id,
                    clientSecret : 'efb611a216f842919dbf1767be1c2f08',//config.spotify.secret,
                    redirectUri : 'http://localhost:8080',
                });
//			}
		}

        service.searchSpotify = function (query) {
            // Search tracks whose artist's name contains 'Kendrick Lamar', and track name contains 'Alright'
            spotify.searchTracks('track:' + query)
              .then(function(data) {
                console.log('Search tracks by "Alright" in the track name and "Kendrick Lamar" in the artist name', data.body);
                service.spotifyResponse = data;
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
