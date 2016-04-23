(function() {
    'use strict';

    var Hyperion = require('hyperion-client');

    function HyperionService($http, $translate) {
        var service = {};

        // update Hyperion lights
        service.performUpdate = function(spokenWords){

            // split string into separate words
            var spokenWords = spokenWords.toLowerCase().split(" ");

            // what locations are defined in the config
            var definedLocations = [];
            for(var i = 0; i < config.hyperion.length; i++){
                definedLocations.push(config.hyperion[i].name.toLowerCase());
            }

            var parameter = {};
            parameter['locations'] = [];
            parameter['on'] = true;

            // what has been said
            for(var i = 0; i < spokenWords.length; i++){
                console.log("Checking word:", spokenWords[i]);


                var index = definedLocations.indexOf(spokenWords[i]);
                if(index > -1){
                    parameter['locations'].push(index);
                }

                // turn lights on or off?
                if($translate.instant('lights.action.off') == spokenWords[i]){
                    parameter['on'] = false;
                }

                // Choose Color
                if($translate.instant('lights.colors.red') == spokenWords[i]){
                    parameter['color'] = [255, 0, 0];
                } else if($translate.instant('lights.colors.green') == spokenWords[i]){
                    parameter['color'] = [0, 255, 0];
                } else if($translate.instant('lights.colors.blue') == spokenWords[i]){
                    parameter['color'] = [0, 0, 255];
                } else if($translate.instant('lights.colors.yellow') == spokenWords[i]){
                    parameter['color'] = [255, 255, 0];
                } else if($translate.instant('lights.colors.orange') == spokenWords[i]){
                    parameter['color'] = [255, 127, 0];
                } else if($translate.instant('lights.colors.pink') == spokenWords[i]){
                    parameter['color'] = [255, 0, 255];
                } else if($translate.instant('lights.colors.purple') == spokenWords[i]){
                    parameter['color'] = [127, 0, 127];
                } else if($translate.instant('lights.colors.white') == spokenWords[i]){
                    parameter['color'] = [255, 255, 255];
                }

                // Adjust brightness
                if(spokenWords[i] == '100%' || $translate.instant('lights.intensity.max').includes(spokenWords[i])){
                    parameter['brightness'] = 1.0;
                } else if(spokenWords[i] == '10%'){
                    parameter['brightness'] = 0.1;
                } else if(spokenWords[i] == '20%'){
                    parameter['brightness'] = 0.2;
                } else if(spokenWords[i] == '25%' || $translate.instant('lights.intensity.quarter').includes(spokenWords[i])){
                    parameter['brightness'] = 0.25;
                } else if(spokenWords[i] == '30%'){
                    parameter['brightness'] = 0.3;
                } else if(spokenWords[i] == '40%'){
                    parameter['brightness'] = 0.3;
                } else if(spokenWords[i] == '50%' || $translate.instant('lights.intensity.half').includes(spokenWords[i])){
                    parameter['brightness'] = 0.5;
                } else if(spokenWords[i] == '60%'){
                    parameter['brightness'] = 0.6;
                } else if(spokenWords[i] == '70%'){
                    parameter['brightness'] = 0.7;
                } else if(spokenWords[i] == '75%' || $translate.instant('lights.intensity.threequarter').includes(spokenWords[i])){
                    parameter['brightness'] = 0.75;
                } else if(spokenWords[i] == '80%'){
                    parameter['brightness'] = 0.8;
                } else if(spokenWords[i] == '90%'){
                    parameter['brightness'] = 0.9;
                }

                // special mode
                if($translate.instant('lights.action.nightmode').includes(spokenWords[i])){
                    parameter['color'] = [255, 0, 0];
                    parameter['brightness'] = 0.1
                }

                // reset all LED
                if($translate.instant('lights.action.reset').includes(spokenWords[i])){
                    localStorage.clear()
                }

            }

            // if spoken words contain no location, use all defined locations
            if(parameter['locations'].length == 0){
                for(var i = 0; i < definedLocations.length; i++){
                    parameter['locations'].push(i);
                }
            }

            var settings = [];

            // get remaining info from local storage
            for(var j = 0 ; j < parameter['locations'].length; j++){
                var i = parameter['locations'][j];
                var setting = {};
                // read settings from storage or use default
                if(localStorage.getItem('Hyperion_Client_' + i) == null){
                    setting['color'] = [255, 255, 255];
                    setting['brightness'] = 0.4
                }
                else {
                    setting = JSON.parse(localStorage.getItem('Hyperion_Client_' + i));
                }

                // overwrite settings with spoken info
                for(var key in parameter){
                    if(parameter.hasOwnProperty(key)) {
                        setting[key] = parameter[key];
                    }
                }

                // save new values in local storage
                localStorage.setItem('Hyperion_Client_' + i, JSON.stringify(setting));

                setting['location'] = i;

                settings.push(setting);
            }

            settings.map(updateHyperion);
        }

        function updateHyperion(setting){
            for(var i = 0; i <  setting['color'].length; i++){
                    setting['color'][i] = Math.round(setting['color'][i] * setting['brightness']);
                }
            //connect to the configured Hyperion clients
            var j = setting['location'];
            var hyperion = new Hyperion( config.hyperion[j].ip, config.hyperion[j].port);

            hyperion.on('connect', function(){
                if(setting['on']){
                    hyperion.setColor(setting['color']);
                }
                else{
                    hyperion.clearall();
                }
            });

            hyperion.on('error', function(error){
                console.error('error:', error);
            });
        }
        return service;
    }

    angular.module('SmartMirror')
        .factory('HyperionService', HyperionService);

}());
