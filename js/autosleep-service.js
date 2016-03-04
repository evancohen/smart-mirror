(function() {
    'use strict';

    function AutoSleepService($interval, $filter) {
        var service = {};
        var autoSleepTimer;

        service.startAutoSleepTimer = function($scope) {
            if (typeof config.autoTimer !== 'undefined' && typeof config.autoTimer.autosleep !== 'undefined' && typeof config.autoTimer.autowake !== 'undefined') {
                service.scope = $scope;
                service.stopAutoSleepTimer();
                autoSleepTimer = $interval(service.sleep, config.autoTimer.autosleep);
                console.debug('Starting auto-sleep timer', config.autoTimer.autosleep);
            }
        };

        service.stopAutoSleepTimer = function() {
            console.debug('Stopping auto-sleep timer');
            $interval.cancel(autoSleepTimer);
        };

        service.checkWakeUp = function() {
            if (typeof config.autoTimer !== 'undefined' && typeof config.autoTimer.autowake !== 'undefined' && config.autoTimer.autowake == $filter('date')(service.scope.date, 'HH:mm:ss')) {
                console.debug('Auto-wake', config.autoTimer.autowake);
                service.wake();
                service.startAutoSleepTimer(service.scope);
            }
        };

        service.wake = function() {
            exec("/opt/vc/bin/tvservice -p", puts);
            service.scope.focus = "default";
        };

        service.sleep = function() {
            exec("/opt/vc/bin/tvservice -o", puts);
            service.scope.focus = "sleep";
        };

        return service;
    }

    angular.module('SmartMirror')
        .factory('AutoSleepService', AutoSleepService);

}());