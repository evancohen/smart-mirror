(function(annyang) {
    'use strict';

    function AnnyangService($rootScope) {
        var service = {};

        // COMMANDS
        service.commands = {};

        service.addCommand = function(phrase, callback) {
            var command = {};

            // Wrap annyang command in scope apply
            command[phrase] = function(arg1, arg2) {
                $rootScope.$apply(callback(arg1, arg2));
            };

            // Extend our commands list
            angular.extend(service.commands, command);

            // Add the commands to annyang
            annyang.addCommands(service.commands);
            console.debug('added command "' + phrase + '"', service.commands);
        };

        service.setLanguage = function(langCode) {
            annyang.setLanguage(langCode);
        };

        service.setLanguage(config.language);

        service.start = function(listening, interimResult, result, error) {
            annyang.addCommands(service.commands);
            annyang.debug(true);
            // add specified callback functions
            if (typeof(listening) == "function") {
                annyang.addCallback('start', function(){$rootScope.$apply(listening(true));});
                annyang.addCallback('end', function(data){console.log("End", data)});
            };
            if (typeof(interimResult) == "function") {
                annyang.addCallback('interimResult', function(data){$rootScope.$apply(interimResult(data));});
            };
            if (typeof(result) == "function") {
                annyang.addCallback('result', function(data){$rootScope.$apply(result(data));});
            };
            if (typeof(error) == "function") {
                annyang.addCallback('error', function(data){$rootScope.$apply(error(data));});
            };
            annyang.start();
        };
        
        service.abort = function(){
            annyang.abort();
        }

        return service;
    }

    angular.module('SmartMirror')
        .factory('AnnyangService', AnnyangService);

}(window.annyang));
