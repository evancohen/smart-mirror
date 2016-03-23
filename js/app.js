(function(angular) {
    'use strict';

    angular.module('SmartMirror', ['ngAnimate', 'tmh.dynamicLocale', 'pascalprecht.translate'])
        .config(function(tmhDynamicLocaleProvider) {
        var locale = config.language.toLowerCase();
        tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_' + locale + '.js');
    })
        .config(['$translateProvider', function ($translateProvider) {
            $translateProvider
                .uniformLanguageTag('bcp47')
                .useStaticFilesLoader({
                    prefix: 'locales/',
                    suffix: '.json'
                });
            $translateProvider.useSanitizeValueStrategy(null);
            $translateProvider.preferredLanguage(config.language);
        }]);

}(window.angular));
