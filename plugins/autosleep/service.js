(function () {
    'use strict';


    function AutoSleepService($interval) {
        var service = {};
        var autoSleepTimer;
        service.woke = true;
        service.exec = require('child_process').exec;

        service.startAutoSleepTimer = function () {
            
            var milliConversion = 60000
            if (typeof config.autoTimer !== 'undefined' && typeof config.autoTimer.autoSleep !== 'undefined' && typeof config.autoTimer.autoWake !== 'undefined') {
                service.stopAutoSleepTimer();
                // assume if autoSleep is greater than 1 minute in milliseconds the value is already converted. if not convert
                if (config.autoTimer.autoSleep>60000){
                    milliConversion = 1
                    console.info('ProTip: Change your config so that config.autoTimer.autoSleep is in minutes not milliseconds.');
                }
                autoSleepTimer = $interval(service.sleep, config.autoTimer.autoSleep*milliConversion);
                console.debug('Starting auto-sleep timer', config.autoTimer.autoSleep*milliConversion);
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
    
    ipcRenderer.on('Error', (event, spotted) => {
	    console.debug("Motion",spotted);
        });

        return service;
    }

    angular.module('SmartMirror')
        .factory('AutoSleepService', AutoSleepService);

} ());