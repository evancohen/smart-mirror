
(function() {
    'use strict';

    function AutoSleepService($interval) {
        var service = {};
        var autoSleepTimer;
        var timer = false;
        var monitor_is_on = true;
        if (typeof config.autotimer !== 'undefined'){
          service.debug = config.autotimermotion.debug || true
		  console.debug(service.debug)
          service.autotimerenable = config.autotimermotion.autotimerenable || true
		  console.debug(service.autotimerenable)
          if (service.debug){
            service.autosleep = config.autotimermotion.autosleep || 0.5
          } else {
            service.autosleep = config.autotimermotion.autosleep || 40.0
          }
		  console.debug(service.autosleep
          service.autowake = config.autotimermotion.autowake ||'07:00:00'
		  console.debug(service.autowake)
        }
        
        service.exec = require('child_process').exec;
        
        service.debugging = function(data) {
        if (service.debug){
            console.debug(data);
            }
        };
        
        // Inicialize Motion Detector IPC
        ipcRenderer.on('motion', (event, arg) => {
            if (arg) {
                if (timer) {
                    service.stopAutoSleepTimer();
                };
                if (!(monitor_is_on)){
                    service.wake();
                };
            } else {
                if (!(timer)) {
                   service.startAutoSleepTimer();
                }
		    }
		    });
        ipcRenderer.on('motion_stdout', (event, arg) => {
            service.debuging(arg);
            });
        ipcRenderer.on('motion_debug', (event, arg) => {
            service.debugging(arg);
            });
        
        service.startAutoSleepTimer = function() {
            if (service.autotimerenable){
                service.stopAutoSleepTimer();
                autoSleepTimer = $interval(service.sleep, service.autosleep*60000);
                service.debugging('Starting auto-sleep timer '+service.autosleep);
                timer = true;
            };
        };

        service.stopAutoSleepTimer = function() {
            service.debugging('Stopping auto-sleep timer');
            $interval.cancel(autoSleepTimer);
            timer=false;
        };

        service.wake = function() {
            service.stopAutoSleepTimer();
            service.exec('/opt/vc/bin/tvservice -p', service.puts);
            service.exec('fbset -depth 8 && fbset -depth 16 && sudo xrefresh', service.puts);
            monitor_is_on = true;
        };

        service.sleep = function() {
            service.stopAutoSleepTimer();
            service.exec('/opt/vc/bin/tvservice -o', service.puts);
            monitor_is_on = false;
            };

        service.puts = function (error, stdout, stderr) {
            if (error) {
                service.debugging('auto-sleep error', error);
            }

            service.debugging('autosleep stdout:', stdout)
        };

        return service;
    }

    angular.module('SmartMirror')
        .factory('AutoSleepService', AutoSleepService);

}());