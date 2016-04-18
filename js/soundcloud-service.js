(function() {
    'use strict';

    function SoundCloudService($http) {
        var service = {};
		service.scResponse = null;

		service.init = function() {
			SC.initialize({
				client_id: "802c2f1c80c96881ff265799929e8a2c"
			});
		}

        //Returns the soundcloud search results for the given query
        service.searchSoundCloud = function(query) {
            return $http.get('https://api.soundcloud.com/tracks.json?client_id=' + "802c2f1c80c96881ff265799929e8a2c" + '&q=' + query + '&limit=1').
                then(function(response) {
                    service.scResponse = response.data;
					console.debug("SoundCloud link: ", service.scResponse[0].permalink_url);
					return service.scResponse;
                });
        };
        return service;
    }

    angular.module('SmartMirror')
        .factory('SoundCloudService', SoundCloudService);

}());
