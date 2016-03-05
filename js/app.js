(function(angular) {
    'use strict';

    angular.module('SmartMirror', ['ngAnimate', 'tmh.dynamicLocale']).config(function(tmhDynamicLocaleProvider) {
        var locale = config.locale.toLowerCase();
        console.debug("Locale : " + locale);
        tmhDynamicLocaleProvider.localeLocationPattern('https://code.angularjs.org/1.2.20/i18n/angular-locale_'+locale+'.js');
    });

}(window.angular));