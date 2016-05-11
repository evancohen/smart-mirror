(function() {
    'use strict';

    function SelfieService() {
        var service = {};
        
        var runShell = function(command){

            var sys = require('util'),
            exec = require('child_process').exec;
            
            function puts(error, stdout, stderr) { 
                console.log(stdout); //log this in browser window
            }
            
            exec(command, puts);
        }

        
        service.runScript = function() {
            runShell(‘./takeaselfie.sh’);
        }

        return service;
    }

    angular.module('SmartMirror')
        .factory(’SelfieService’, SelfieService);

}(window.annyang));
