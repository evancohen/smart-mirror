(function () {
    'use strict';

    function AutoSleepService($interval) {
        var service = {};
        var autoSleepTimer;

        service.exec = require('child_process').exec;

        service.startAutoSleepTimer = function () {
            if (typeof config.autoTimer !== 'undefined' && typeof config.autoTimer.autoSleep !== 'undefined' && typeof config.autoTimer.autoWake !== 'undefined') {
                service.stopAutoSleepTimer();
                autoSleepTimer = $interval(service.sleep, config.autoTimer.autoSleep);
                console.debug('Starting auto-sleep timer', config.autoTimer.autoSleep);
            }
        };

	service.stopAutoSleepTimer = function () {
            console.debug('Stopping auto-sleep timer');
            $interval.cancel(autoSleepTimer);
        };

        service.wake = function () {
	    service.woke = true;
            service.exec(config.autoTimer.wake_cmd, service.puts);
        };

        service.sleep = function () {
	    service.woke = false;
            service.exec(config.autoTimer.sleep_cmd, service.puts);
        };

        service.puts = function (error, stdout, stderr) {
            if (error) {
                console.debug('auto-sleep error', error);
            }

            console.debug('autosleep stdout:', stdout)
        };

	
	ipcRenderer.on('motionstart', (event, spotted) => {
		console.debug('motionstart detected')
		service.wake();
		service.stopAutoSleepTimer();
        });

	ipcRenderer.on('motionend', (event, spotted) => {
		console.debug('motionend detected')
		service.startAutoSleepTimer();
        });

        return service;
    }

    angular.module('SmartMirror')
        .factory('AutoSleepService', AutoSleepService);

} ());
