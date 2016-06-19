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
            service.exec(config.autoTimer.wake_cmd, service.puts);
        };

        service.sleep = function() {
            service.exec(config.autoTimer.sleep_cmd, service.puts);
        };

        service.sys = require('sys');
        service.exec = require('child_process').exec;

        service.puts = function (error, stdout, stderr) {
            service.puts(stdout);
        };

        return service;
    }

    angular.module('SmartMirror')
        .factory('AutoSleepService', AutoSleepService);

}());