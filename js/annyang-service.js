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

        service.start = function(listening) {
            annyang.addCommands(service.commands);
            annyang.debug(true);
            annyang.start();
            if (typeof(listening) == "function") {
                annyang.addCallback('start', function(){$rootScope.$apply(listening(true));});
                annyang.addCallback('end', function(data){console.log("End", data)});
            };
        };
        
        return service;
    }

    angular.module('SmartMirror')
        .factory('AnnyangService', AnnyangService);

}(window.annyang));