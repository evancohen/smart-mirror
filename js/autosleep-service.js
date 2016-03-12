(function() {
    'use strict';

    function AutoSleepService($interval) {
        var service = {};
        var autoSleepTimer;

        service.startAutoSleepTimer = function() {
            if (typeof config.autoTimer !== 'undefined' && typeof config.autoTimer.autosleep !== 'undefined' && typeof config.autoTimer.autowake !== 'undefined') {
                service.stopAutoSleepTimer();
                autoSleepTimer = $interval(service.sleep, config.autoTimer.autosleep);
                console.debug('Starting auto-sleep timer', config.autoTimer.autosleep);
            }
        };

        service.stopAutoSleepTimer = function() {
            console.debug('Stopping auto-sleep timer');
            $interval.cancel(autoSleepTimer);
        };

        service.wake = function() {
            exec("/opt/vc/bin/tvservice -p", puts);
        };

        service.sleep = function() {
            exec("/opt/vc/bin/tvservice -o", puts);
        };

        return service;
    }

    angular.module('SmartMirror')
        .factory('AutoSleepService', AutoSleepService);

}());