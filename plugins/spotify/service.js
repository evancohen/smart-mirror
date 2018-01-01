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
//			if (typeof config.spotify != 'undefined' && config.spotify.length) {

            
                if (config.spotify.auth) {
                    // Create the api object with the credentials
                    var spotifyApi = new SpotifyWebApi({
                        clientId : config.spotify.id,
                        clientSecret : config.spotify.secret
                    });
                    
                    spotify.setAccessToken(config.spotify.auth);
                } else {
                    // RETRIEVE AUTH TOKEN
                    var spotify = new SpotifyWebApi({
                        redirectUri : 'http://localhost:8888',
                        clientId : config.spotify.id
                    });
                    
                    var authorizeURL = spotify.createAuthorizeURL(['user-read-private', 'user-read-email'], (new Date().getMilliseconds()).toString());
                    console.log(authorizeURL);
                }
//                var test = $http.get(authorizeURL)
////                    .success(function() {
//                    .then(function(response) {
//                        console.log(response);
//                    });
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
