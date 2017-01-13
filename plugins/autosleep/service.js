/* global ipcRenderer */
(function () {
    'use strict';

    function AutoSleepService($interval, Focus) {
        var service = {};
        var autoSleepTimer;
        service.woke = true;
        service.scope = "default";
        service.exec = require('child_process').exec;

        service.startAutoSleepTimer = function () {

            var milliConversion = 60000
            if (typeof config.autoTimer !== 'undefined' && typeof config.autoTimer.autoSleep !== 'undefined' && typeof config.autoTimer.autoWake !== 'undefined') {
                service.stopAutoSleepTimer();
                // assume if autoSleep is greater than 1 minute in milliseconds the value is already converted. if not convert
                if (config.autoTimer.autoSleep > 60000) {
                    milliConversion = 1
                    console.info('ProTip: Change your config so that config.autoTimer.autoSleep is in minutes not milliseconds.');
                }
                autoSleepTimer = $interval(service.sleep, config.autoTimer.autoSleep * milliConversion);
                console.debug('Starting auto-sleep timer', config.autoTimer.autoSleep * milliConversion);
            }
        };

        service.stopAutoSleepTimer = function () {
            console.debug('Stopping auto-sleep timer');
            $interval.cancel(autoSleepTimer);
        };

        service.wake = function () {
            service.woke = true;
            if (config.autoTimer.mode == "monitor") {
                service.exec(config.autoTimer.wakeCmd, service.puts);
            }
            Focus.change("default");
        };

        service.sleep = function () {
            service.woke = false;
            if (config.autoTimer.mode == "monitor") {
                service.exec(config.autoTimer.sleepCmd, service.puts);
                Focus.change("sleep");
            } else if (config.autoTimer.mode == "tv") {
                Focus.change("sleep");
            } else {
                Focus.change("default");
            }

        };

        service.puts = function (error, stdout, stderr) {
            if (error) {
                console.debug('auto-sleep error', error);
            }
            console.debug('autosleep stdout:', stdout)
            console.debug('autosleep stderr:', stderr)
        };


        ipcRenderer.on('motionstart', () => {
            service.wake()
            console.debug('motion start detected');
        });

        ipcRenderer.on('remoteWakeUp', () => {
            service.wake()
            console.debug('remote wakeUp detected');
        });

        ipcRenderer.on('remoteSleep', () => {
            service.sleep()
            console.debug('remote sleep detected');
        });

        ipcRenderer.on('motionend', () => {
            console.debug('motion end detected');
            service.startAutoSleepTimer();
        });

        ipcRenderer.on('calibrated', () => {
            console.debug('motion.js Calibrated');
        });

        ipcRenderer.on('Error', (event, error) => {
            console.debug("Motion", error);
        });

        return service;
    }

    angular.module('SmartMirror')
        .factory('AutoSleepService', AutoSleepService);

} ());