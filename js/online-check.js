(function() {
    'use strict';

    function ConnectionCheckService($window, $rootScope) {
        var service = {};

        service.onLine = $window.navigator.onLine;

        service.isOnline = function() {
            return service.onLine;
        }

        $window.addEventListener("online", function () {
            service.onLine = true;
            $rootScope.$digest();
        }, true);

        $window.addEventListener("offline", function () {
            service.onLine = false;
            $rootScope.$digest();
        }, true);

        return service;
    }

    angular.module('SmartMirror')
        .factory('ConnectionCheckService', ConnectionCheckService);

}());