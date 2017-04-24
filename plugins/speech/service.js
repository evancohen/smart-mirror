const {ipcRenderer} = require('electron');

(function () {
	'use strict';

	function SpeechService($rootScope, $translate) {
		var service = {}
		var callbacks = {}
		var commandList = []
		var commandPage = []

		service.init = function (cb) {
            // workaround so we can trigger requests at any time 
			annyang.isListening = () => { return true }
            // Set lenguage and debug state
			annyang.setLanguage((typeof config.general.language != 'undefined') ? config.general.language : 'en-US')
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

			ipcRenderer.on('hotword', () => {
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
				service.addRawCommand(translations[voiceId], callback, translations[descId], translations[textId])
			});
		};

		service.addRawCommand = function (phrase, callback, commandDescription, commandText) {
			var command = {};
			command[phrase] = function (arg1, arg2) {
				$rootScope.$apply(callback(arg1, arg2))
			}
			var commandItem = { "text": commandText || phrase, "description": commandDescription };
			commandList.push(commandItem);

            // Extend our commands list
			angular.extend(service.commands, command)

            // Add the commands to annyang
			annyang.addCommands(service.commands)
			console.debug('added command "' + phrase + '"', service.commands)
		}


		service.getCommands = function () {
			for (var i=0; i < Math.ceil(commandList.length/(config.speech.commandsPerPage || 10)); i++) {
				commandPage.push(commandList.splice(i, i+9))
			}
			return commandPage
		}

		return service;
	}

	angular.module('SmartMirror')
        .factory('SpeechService', SpeechService)

} (window.annyang));
