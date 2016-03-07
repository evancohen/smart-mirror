(function(angular) {
    'use strict';

    angular.module('SmartMirror', ['ngAnimate', 'tmh.dynamicLocale']).config(function(tmhDynamicLocaleProvider) {
        var locale = config.language.toLowerCase();
        tmhDynamicLocaleProvider.localeLocationPattern('node_modules/angular-i18n/angular-locale_' + locale + '.js');
    });

}(window.angular));