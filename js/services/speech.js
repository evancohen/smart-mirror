(function(annyang) {
    'use strict';

    function SpeechService($rootScope) {
        var service = {};
   
        service.init = function() {
            annyang.setLanguage(config.language);            
            console.log("Initializing keyword spotter");
            
            var modelFile = config.kws.model || "smart_mirror.pmdl";
            var kwsSensitivity = config.kws.sensitivity || 0.5;
            
            var spawn = require('child_process').spawn;
            var kwsProcess = spawn('python', ['./speech/kws.py', modelFile, kwsSensitivity], {detached: false});
            console.log(kwsProcess);
            kwsProcess.stderr.on('data', function (data) {
                var message = data.toString();
                if(message.startsWith('INFO')){
                    annyang.start();
                }else{
                    console.error(message);
                }
            })
            kwsProcess.stdout.on('data', function (data) {
                console.log(data.toString())
            })
        }

        // Register callbacks for the controller. does not utelize CallbackManager()
        service.registerCallbacks = function(cb) {
            // annyang.addCommands(service.commands);
            
            // Annyang is a bit "chatty", turn this on only for debugging
            annyang.debug(false);
            
            // add specified callback functions
            if (isCallback(cb.listening)) {
                annyang.addCallback('start', function(){
                    $rootScope.$apply(cb.listening(true));
                });
                annyang.addCallback('end', function(data){
                    $rootScope.$apply(cb.listening(false));
                });
            };
            if (isCallback(cb.interimResult)) {
                annyang.addCallback('interimResult', function(data){
                    $rootScope.$apply(cb.interimResult(data));
                });
            };
            if (isCallback(cb.result)) {
                annyang.addCallback('result', function(data){
                    $rootScope.$apply(cb.result(data));
                });
            };
            if (isCallback(cb.error)) {
                annyang.addCallback('error', function(data){
                    $rootScope.$apply(cb.error(data));
                });
            };
        };
        
        // Ensure callback is a valid function
        function isCallback(callback){
            return typeof(callback) == "function";
        }
        
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
        
        // Annyang start listening
        service.start = function(){
            // Listen for the next utterance and then stop
            annyang.start({autoRestart: false, continuous: false});
        }
        
        // Annyang stop listening
        service.abort = function(){
            annyang.abort();
        }
        
        service.init();

        return service;
    }

    angular.module('SmartMirror')
        .factory('SpeechService', SpeechService);

}(window.annyang));
