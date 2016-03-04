(function() {
    'use strict';

    function AutoSleepService($interval, $filter) {
        var service = {};
        var autoSleepTimer;

        service.startAutoSleepTimer = function($scope) {
            if (typeof config.autoTimer !== 'undefined' && typeof config.autoTimer.autosleep !== 'undefined' && typeof config.autoTimer.autowake !== 'undefined') {
                service.scope = $scope;
                service.stopAutoSleepTimer();
                autoSleepTimer = $interval(service.sleepInterval, config.autoTimer.autosleep);
                console.debug('Starting auto-sleep timer', config.autoTimer.autosleep);
            }
        };

        service.sleepInterval = function() {
            console.debug('Auto-sleep.');
            service.scope.focus = "sleep";
            exec("/opt/vc/bin/tvservice -o", puts);
        };

        service.stopAutoSleepTimer = function() {
            console.debug('Stopping auto-sleep timer');
            $interval.cancel(autoSleepTimer);
        };

        service.checkWakeUp = function() {
            if (typeof config.autoTimer !== 'undefined' && typeof config.autoTimer.autowake !== 'undefined' && config.autoTimer.autowake == $filter('date')(service.scope.date, 'HH:mm:ss')) {
                console.debug('Auto-wake', config.autoTimer.autowake)
                exec("/opt/vc/bin/tvservice -p", puts);
                service.scope.focus = "default";
                service.startAutoSleepTimer(service.scope);
            }
        };

        return service;
    }

    angular.module('SmartMirror')
        .factory('AutoSleepService', AutoSleepService);

}());