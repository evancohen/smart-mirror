(function (angular) {
    'use strict';

    function MirrorCtrl(
        SpeechService,
        AutoSleepService,
        LightService,
        $rootScope, $scope, $timeout, $interval, tmhDynamicLocale, $translate) {

        // Local Scope Vars
        var _this = this;
        $scope.listening = false;
        $scope.debug = false;
        $scope.focus = "default";
        $scope.commands = [];
        $scope.partialResult = $translate.instant('home.commands');
        $scope.layoutName = 'main';
        $scope.config = config;

        //set lang
        moment.locale(
            (typeof config.general.language !== 'undefined') ? config.general.language : 'en-US',
            {
                calendar: {
                    lastWeek: '[Last] dddd',
                    lastDay: '[Yesterday]',
                    sameDay: '[Today]',
                    nextDay: '[Tomorrow]',
                    nextWeek: 'dddd',
                    sameElse: 'L'
                }
            }
        );
        //Initialize the speech service

        var resetCommandTimeout;
        SpeechService.init({
            listening: function (listening) {
                $scope.listening = listening;
                if (listening && !AutoSleepService.woke) {
                    AutoSleepService.wake()
                    $scope.focus = AutoSleepService.scope;
                }
            },
            partialResult: function (result) {
                $scope.partialResult = result;
                $timeout.cancel(resetCommandTimeout);
            },
            finalResult: function (result) {
                if (typeof result !== 'undefined') {
                    $scope.partialResult = result;
                    resetCommandTimeout = $timeout(restCommand, 5000);
                }
            },
            error: function (error) {
                console.log(error);
                if (error.error == "network") {
                    $scope.speechError = "Google Speech Recognizer: Network Error (Speech quota exceeded?)";
                }
            }
        });

        //Update the time
        function updateTime() {
            $scope.date = new moment();

            // Auto wake at a specific time
            if (typeof config.autoTimer !== 'undefined' && typeof config.autoTimer.autoWake !== 'undefined' && config.autoTimer.autoWake == moment().format('HH:mm:ss')) {
                console.debug('Auto-wake', config.autoTimer.autoWake);
                AutoSleepService.wake()
                $scope.focus = AutoSleepService.scope;
                AutoSleepService.startAutoSleepTimer();
            }
        }

        // Reset the command text
        var restCommand = function () {
            $translate('home.commands').then(function (translation) {
                $scope.partialResult = translation;
            });
        };

        _this.init = function () {
            AutoSleepService.startAutoSleepTimer();

            var tick = $interval(updateTime, 1000);
            updateTime();
            restCommand();

            var defaultView = function () {
                console.debug("Ok, going to default view...");
                $scope.focus = "default";
            }

            // List commands
            SpeechService.addCommand('list', function () {
                console.debug("Here is a list of commands...");
                console.log(SpeechService.commands);
                $scope.commands = SpeechService.getCommands();
                $scope.focus = "commands";
            });

            // Go back to default view
            SpeechService.addCommand('home', defaultView);

            SpeechService.addCommand('debug', function () {
                console.debug("Boop Boop. Showing debug info...");
                $scope.debug = true;
            });

            // Check the time
            SpeechService.addCommand('time_show', function (task) {
                console.debug("It is", moment().format('h:mm:ss a'));
            });

            // Control light
            SpeechService.addCommand('light_action', function (state, action) {
                LightService.performUpdate(state + " " + action);
            });
        };

        _this.init();
    }

    angular.module('SmartMirror')
        .controller('MirrorCtrl', MirrorCtrl);

    function themeController($scope) {
        $scope.layoutName = (typeof config.layout !== 'undefined' && config.layout) ? config.layout : 'main';
    }

    angular.module('SmartMirror')
        .controller('Theme', themeController);

} (window.angular));
