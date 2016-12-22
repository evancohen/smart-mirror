const {ipcRenderer} = require('electron');

(function () {
    'use strict';

    function SpeechService($rootScope, $translate) {
        var service = {}
        var callbacks = {}
        var commandList = []

        service.init = function (cb) {
            // workaround so we can trigger requests at any time 
            annyang.isListening = () => { return true }
            // Set lenguage and debug state
            annyang.setLanguage((typeof config.language != 'undefined') ? config.language : 'en-US')
            annyang.debug(false)

            // add specified callback functions
            if (isCallback(cb.listening)) {
                callbacks.listening = function (bool) {
                    $rootScope.$apply(cb.listening(bool))
                }
            }
            if (isCallback(cb.partialResult)) {
                callbacks.partialResult = function (data) {
                    $rootScope.$apply(cb.partialResult(data))
                }
            }
            if (isCallback(cb.finalResult)) {
                callbacks.finalResult = function (data) {
                    $rootScope.$apply(cb.finalResult(data))
                }
            }
            if (isCallback(cb.error)) {
                callbacks.error = function (data) {
                    $rootScope.$apply(cb.error(data))
                }
            }

            ipcRenderer.on('hotword', (event, spotted) => {
                callbacks.listening(true)
            })

            ipcRenderer.on('partial-results', (event, text) => {
                callbacks.partialResult(text)
            })

            ipcRenderer.on('final-results', (event, text) => {
                callbacks.finalResult(text)
                annyang.trigger(text)
                callbacks.listening(false)
            })

        }

        // Ensure callback is a valid function
        function isCallback(callback) {
            return typeof (callback) == "function";
        }

        // COMMANDS
        service.commands = {}

        service.addCommand = function (commandId, callback) {
            var voiceId = 'commands.' + commandId + '.voice';
            var textId = 'commands.' + commandId + '.text';
            var descId = 'commands.' + commandId + '.description';
            $translate([voiceId, textId, descId]).then(function (translations) {
                var command = {};
                var phrase = translations[voiceId];
                command[phrase] = function (arg1, arg2) {
                    $rootScope.$apply(callback(arg1, arg2))
                };
                if (translations[textId] !== '') {
                    var commandItem = { "text": translations[textId], "description": translations[descId] };
                    commandList.push(commandItem);
                }

                // Extend our commands list
                angular.extend(service.commands, command)

                // Add the commands to annyang
                annyang.addCommands(service.commands)
                console.debug('added command "' + phrase + '"', service.commands)
            });
        };

        service.getCommands = function(){
            return commandList;
        }

        return service;
    }

    angular.module('SmartMirror')
        .factory('SpeechService', SpeechService)

} (window.annyang));
