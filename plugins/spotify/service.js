/* global SC:true */
(function () {
	'use strict';

	function SpotifyService($http) {
		var service = {};
        var SpotifyWebApi = require('spotify-web-api-node');
        var spotifyApi = new SpotifyWebApi();
        
		service.spotifyResponse = null;

		service.init = function () {
      // If the spotify key is defined and not empty
//			if (typeof config.spotify != 'undefined' && config.spotify.length) {
                spotifyApi.setAccessToken(config.spotify.access_token);
                spotifyApi.setRefreshToken(config.spotify.refresh_token);
            
                // Get the credentials one by one
                console.log('The access token is ' + spotifyApi.getAccessToken());
                console.log('The refresh token is ' + spotifyApi.getRefreshToken());
                console.log('The redirectURI is ' + spotifyApi.getRedirectURI());
                console.log('The client ID is ' + spotifyApi.getClientId());
                console.log('The client secret is ' + spotifyApi.getClientSecret());

                // Get all credentials
                console.log('The credentials are ' + spotifyApi.getCredentials());
            
//                spotifyApi.refreshAccessToken()
//                  .then(function(data) {
//                    console.log('The access token has been refreshed!');
//
//                    // Save the access token so that it's used in future calls
//                    spotifyApi.setAccessToken(data.body['access_token']);
//                  }, function(err) {
//                    console.log('Could not refresh access token', err);
//                  });
                
//            }
		}

        service.searchSpotify = function (query) {
            // Search tracks whose name contains the query
            return spotifyApi.searchTracks('track:' + query)
              .then(function(data) {
                console.log('Search tracks matching "' + query + '"');
                console.log(data);
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
