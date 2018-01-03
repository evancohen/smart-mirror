/* global SC:true */
(function () {
	'use strict';

	function SpotifyService($http) {
		var service = {};
        var SpotifyWebApi = require('spotify-web-api-node');
        var spotifyApi = new SpotifyWebApi();
        
		service.spotifyResponse = null;

		service.init = function () {
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
            
//                spotifyApi.getMyRecentlyPlayedTracks()
//                  .then(function(data) {
//                    console.log('recent tracks:', data.body);
//                  }, function(err) {
//                    console.log('Something went wrong!', err);
//                  });
            
                spotifyApi.getMyDevices()
                  .then(function(data) {
                    console.log('user devices:', data.body);
                  }, function(err) {
                    console.log('Something went wrong!', err);
                  });
            
                spotifyApi.getMyCurrentPlayingTrack()
                  .then(function(data) {
                    console.log('current track:', data.body);
                  }, function(err) {
                    console.log('Something went wrong!', err);
                  });
            
                spotifyApi.getMyCurrentPlaybackState()
                  .then(function(data) {
                    console.log('current playback:', data.body);
                  }, function(err) {
                    console.log('Something went wrong!', err);
                  });
            
//                spotifyApi.transferMyPlayback()
//                  .then(function(data) {
//                    console.log('current playback:', data.body);
//                  }, function(err) {
//                    console.log('Something went wrong!', err);
//                  });
            
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
        
        service.playTrack = function (query) {
            // Search tracks whose name contains the query
            return spotifyApi.searchTracks('track:' + query)
              .then(function(data) {
                console.log('Search tracks matching "' + query + '"');
                console.log(data);
                service.spotifyResponse = data.body.tracks || null;
                
                var options = {
                    "context_uri": data.body.tracks.items[0].uri,
                    "offset": {
                        "position": 5
                    }
                };
                console.log(options);
                
                return spotifyApi.play(options)
                  .then(function(data) {
                    console.log('current playback: "' + query + '"');
                    console.log(data);
                    service.spotifyResponse = data.body.tracks || null;
                    return service.spotifyResponse;
                  }, function(err) {
                    console.log('Something went wrong!', err);
                  });
              }, function(err) {
                console.log('Something went wrong!', err);
              });
        };

        service.searchTrack = function (query) {
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
