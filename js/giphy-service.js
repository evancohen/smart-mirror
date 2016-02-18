(function() {
    'use strict';

    function GiphyService($http) {
        var service = {};
        service.gif = null;

        service.init = function(img){

          return $http.get("http://api.giphy.com/v1/gifs/random?api_key="+config.giphy.key+"&tag="+img).
              then(function(response) {
                  return service.gif = response.data;
              });
        };

        service.giphyImg = function() {
          if(service.gif === null){
              return null;
          }
          return service.gif.data.image_url;
        };

        return service;
    }

    angular.module('SmartMirror')
        .factory('GiphyService', GiphyService);

}(window.annyang));
