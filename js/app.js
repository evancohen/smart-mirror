(function(angular) {
    'use strict';

    angular.module('SmartMirror', ['ngAnimate'])
        .config(["$sceDelegateProvider", function($sceDelegateProvider) {
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                "http://www.youtube.com/embed/**"
            ]);
        }]);

}(window.angular));