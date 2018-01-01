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
            var clientId = config.spotify.id,
                clientSecret = config.spotify.secret;

            // Create the api object with the credentials
            var spotifyApi = new SpotifyWebApi({
              clientId : clientId,
              clientSecret : clientSecret
            });
            
            spotify.setAccessToken('BQAgbDD_4H801NTJ2aH5d7ZtWsRs4feE7ZYySCtjmycJwzURjsOIkdyTNHFlhkS3BwGsssfEedXRbS-CWA1l_5E1rcN5rQHBU4a5R1g5T1UXlWxK4yn3o-pc1gHpANH_cbzDxEDB6LJr0UEOUGnBolYDF3PldPrLIA');
            console.log(spotify);

                
//                //PART1
//                var scopes = ['user-read-private', 'user-read-email'],
//                    redirectUri = 'http://localhost:8888',
//                    clientId = config.spotify.id,
//                    state = 'some-state-of-my-choice';
//
//                // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
//                var spotify = new SpotifyWebApi({
//                  redirectUri : redirectUri,
//                  clientId : clientId
//                });
//
//                // Create the authorization URL
//                var authorizeURL = spotify.createAuthorizeURL(scopes, state);
//
//                // https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
//                console.log(authorizeURL);
		}

        service.searchSpotify = function (query) {
            // Search tracks whose name contains the query
            return spotify.searchTracks('track:' + query)
              .then(function(data) {
                console.log('Search tracks matching "' + query + '"', data.body);
                service.spotifyResponse = data.body;
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
