(function(angular) {
    'use strict';

<<<<<<< HEAD
    angular.module('SmartMirror', ['ngAnimate', 'tmh.dynamicLocale']).config(function(tmhDynamicLocaleProvider) {
        tmhDynamicLocaleProvider.localeLocationPattern('https://code.angularjs.org/1.2.20/i18n/angular-locale_{{locale}}.js');
    });
=======
    angular.module('SmartMirror', ['ngAnimate'])
        .config(["$sceDelegateProvider", function($sceDelegateProvider) {
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                "http://www.youtube.com/embed/**"
            ]);
        }]);
>>>>>>> upstream/search

}(window.angular));