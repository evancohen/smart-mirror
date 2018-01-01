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
                
                
                
//                var credentials = {
//                  clientId : config.spotify.id,
//                  clientSecret : config.spotify.secret,
//                  redirectUri : 'http://www.michaelthelin.se/test-callback'
//                };
//
//                var spotify = new SpotifyWebApi(credentials);
//
//                // The code that's returned as a query parameter to the redirect URI
//                var code = 'MQCbtKe23z7YzzS44KzZzZgjQa621hgSzHN';
//
//                // Retrieve an access token and a refresh token
//                spotify.authorizationCodeGrant(code)
//                  .then(function(data) {
//                    console.log('The token expires in ' + data.body['expires_in']);
//                    console.log('The access token is ' + data.body['access_token']);
//                    console.log('The refresh token is ' + data.body['refresh_token']);
//
//                    // Set the access token on the API object to use it in later calls
//                    spotify.setAccessToken(data.body['access_token']);
//                    spotify.setRefreshToken(data.body['refresh_token']);
//                  }, function(err) {
//                    console.log('Something went wrong!', err);
//                  });
                
                
                
                var scopes = ['user-read-private', 'user-read-email'],
                    redirectUri = 'http://localhost:8080/callback',
                    clientId = config.spotify.id,
                    state = 'some-state-of-my-choice';

                // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
                var spotify = new SpotifyWebApi({
                  redirectUri : redirectUri,
                  clientId : clientId
                });

                // Create the authorization URL
                var authorizeURL = spotify.createAuthorizeURL(scopes, state);

                // https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
                console.log(authorizeURL);
                
                
                
                
//                spotify = new SpotifyWebApi({
//                    clientId : config.spotify.id,
//                    clientSecret : config.spotify.secret,
//                    redirectUri : config.spotify.redirect
//                });
//			}
		}

        service.searchSpotify = function (query) {
            // Search tracks whose artist's name contains 'Kendrick Lamar', and track name contains 'Alright'
            return spotify.searchTracks('track:' + query)
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
