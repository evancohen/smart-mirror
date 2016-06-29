(function() {
    'use strict';

    function AutoSleepService($interval) {
        var service = {};
        var autoSleepTimer;

        service.exec = require('child_process').exec;

        service.startAutoSleepTimer = function() {
            if (typeof config.autoTimer !== 'undefined' && typeof config.autoTimer.autoSleep !== 'undefined' && typeof config.autoTimer.auto_wake !== 'undefined') {
                service.stopAutoSleepTimer();
                autoSleepTimer = $interval(service.sleep, config.autoTimer.autoSleep);
                console.debug('Starting auto-sleep timer', config.autoTimer.autoSleep);
            }
        };

        service.stopAutoSleepTimer = function() {
            console.debug('Stopping auto-sleep timer');
            $interval.cancel(autoSleepTimer);
        };

        service.wake = function() {
            service.exec(config.autoTimer.wake_cmd, service.puts);
        };

        service.sleep = function() {
            service.exec(config.autoTimer.sleep_cmd, service.puts);
        };

        service.puts = function (error, stdout, stderr) {
            if (error) {
                console.debug('auto-sleep error', error);
            }

            console.debug('autosleep stdout:', stdout)
        };

        return service;
    }

    angular.module('SmartMirror')
        .factory('AutoSleepService', AutoSleepService);

}());