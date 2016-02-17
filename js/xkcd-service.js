(function() {
    'use strict';

    function XKCDService($http) {
        var service = {};

        service.getXKCD = function(){
            return $http.jsonp("http://dynamic.xkcd.com/api-0/jsonp/comic?callback=JSON_CALLBACK").
                then(function(response){
                    return response.data;
                });
        };
        
        return service;
    }

    angular.module('SmartMirror')
        .factory('XKCDService', XKCDService);

}());
