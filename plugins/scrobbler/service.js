(function () {
	"use strict";

	function ScrobblerService($http, $q) {
		var service = {};

		service.getCurrentTrack = function () {
			var deferred = $q.defer();
			if (!config.lastfm || !config.lastfm.user || !config.lastfm.key) {
				deferred.resolve(null);
				return deferred.promise;
			}

			var url =
				"http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=" +
				config.lastfm.user +
				"&api_key=" +
				config.lastfm.key +
				"&limit=1&format=json";

			$http
				.get(url)
				.then(function (response) {
					if (response.data.error) {
						console.log("Scrobbler Error: ", response.data.message);
						deferred.reject(response.data.message);
						return;
					}

					var track = response.data.recenttracks && response.data.recenttracks.track;
					track = Array.isArray(track) ? track[0] : track;

					// @attr is only present while a track is currently playing
					if (track && typeof track["@attr"] === "object") {
						deferred.resolve({
							title: track.name,
							artist: track.artist["#text"] || "Unknown",
							album: track.album["#text"] || "",
							cover: track.image[1]["#text"],
							playing: true,
						});
					} else {
						// Nothing playing — resolve empty instead of rejecting (Angular 1.6+)
						deferred.resolve(null);
					}
				})
				.catch(function (err) {
					deferred.reject(err);
				});

			return deferred.promise;
		};

		return service;
	}

	angular.module("SmartMirror").factory("ScrobblerService", ScrobblerService);
})();
