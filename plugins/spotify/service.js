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
            
                // Get the authenticated user
                spotifyApi.getMe()
                  .then(function(data) {
                    console.log('Current authenticated user:', data.body);
                  }, function(err) {
                    console.log('Something went wrong!', err);
                  });
            
//                // Get the credentials one by one
//                console.log('The access token is ' + spotifyApi.getAccessToken());
//                console.log('The refresh token is ' + spotifyApi.getRefreshToken());
//
//                // Get all credentials
//                console.log('The credentials are ', spotifyApi.getCredentials());
            
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

        service.searchTrack = function (query) {
            // Search tracks whose name contains the query
            return spotifyApi.searchTracks('track:' + query)
              .then(function(data) {
                console.log('Search tracks matching "' + query + '"');
                console.log(data);
                service.spotifyResponse = data.body.tracks || null;
                
                /* Get Audio Features for a Track */
                spotifyApi.getAudioFeaturesForTrack(data.body.tracks.items[0].id)
                  .then(function(data) {
                    console.log(data.body);
                    return service.spotifyResponse;
                  }, function(err) {
                    done(err);
                  });
                
//                return service.spotifyResponse;
              }, function(err) {
                console.log('Something went wrong!', err);
              });
        };

        service.getPlaylist = function (query) {
            // Search tracks whose name contains the query
            return spotifyApi.getUserPlaylists(query)
              .then(function(data) {
                console.log('Playlist matching "' + query + '"');
                console.log(data);
//                service.spotifyResponse = data.body.tracks || null;
//                return service.spotifyResponse;
              }, function(err) {
                console.log('Something went wrong!', err);
              });
        };

		return service;
	}

	angular.module('SmartMirror')
    .factory('SpotifyService', SpotifyService);

} ());
