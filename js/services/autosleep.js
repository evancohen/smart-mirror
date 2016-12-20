(function () {
    'use strict';

    function AutoSleepService($interval) {
        var service = {};
        var autoSleepTimer;
	service.woke = true;
        service.exec = require('child_process').exec;

        service.startAutoSleepTimer = function () {
            if (typeof config.autoTimer !== 'undefined' && typeof config.autoTimer.autoSleep !== 'undefined' && typeof config.autoTimer.autoWake !== 'undefined') {
                service.stopAutoSleepTimer();
                autoSleepTimer = $interval(service.sleep, config.autoTimer.autoSleep*60000);
                console.debug('Starting auto-sleep timer', config.autoTimer.autoSleep*60000);
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
	    if (!service.woke) {
		service.wake();
	    }
	    console.debug('motion start detected');
	    service.stopAutoSleepTimer();
        });

	ipcRenderer.on('motionend', (event, spotted) => {
	    console.debug('motion end detected');
	    service.startAutoSleepTimer();
        });

	ipcRenderer.on('calibrated', (event, spotted) => {
	    console.debug('motion.js Calibrated');
        });

        return service;
    }

    angular.module('SmartMirror')
        .factory('AutoSleepService', AutoSleepService);

} ());
