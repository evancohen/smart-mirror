(function() {
    'use strict';

    function AutoSleepService($interval) {
        var service = {};
        var autoSleepTimer;

        service.startAutoSleepTimer = function() {
            if (typeof config.auto_timer !== 'undefined' && typeof config.auto_timer.auto_sleep !== 'undefined' && typeof config.auto_timer.auto_wake !== 'undefined') {
                service.stopAutoSleepTimer();
                autoSleepTimer = $interval(service.sleep, config.auto_timer.auto_sleep);
                console.debug('Starting auto-sleep timer', config.auto_timer.auto_sleep);
            }
        };

        service.stopAutoSleepTimer = function() {
            console.debug('Stopping auto-sleep timer');
            $interval.cancel(autoSleepTimer);
        };

        service.wake = function() {
            service.exec(config.auto_timer.wake_cmd, service.puts);
        };

        service.sleep = function() {
            service.exec(config.auto_timer.sleep_cmd, service.puts);
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