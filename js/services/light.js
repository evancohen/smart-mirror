(function() {
    'use strict';

    var Hyperion = require('hyperion-client');

    function LightService($http, $translate) {
        var service = {};

        // update lights
        service.performUpdate = function(spokenWords){
            // split string into separate words and remove empty ones
            var spokenWords = spokenWords.toLowerCase().split(" ").filter(Boolean);
   
            // what locations are defined in the config
            var definedLocations = [];
            for(var i = 0; i < config.light.setup.length; i++){
                definedLocations.push(config.light.setup[i].name.toLowerCase());
            }

            var SaidParameter = {};
            SaidParameter['locations'] = [];
            SaidParameter['on'] = true;

            // what has been said
            for(var i = 0; i < spokenWords.length; i++){
                var index = definedLocations.indexOf(spokenWords[i]);
                if(index > -1){
                    SaidParameter['locations'].push(index);
                }

                // turn lights on or off?
                if($translate.instant('lights.action.off') == spokenWords[i]){
                    SaidParameter['on'] = false;
                }

                // Choose Color
                if($translate.instant('lights.colors.red') == spokenWords[i]){
                    SaidParameter['colorRGB'] = [255, 0, 0];
                    SaidParameter['colorHSV'] = [0, 255, 254];
                } else if($translate.instant('lights.colors.green') == spokenWords[i]){
                    SaidParameter['colorRGB'] = [0, 255, 0];
                    SaidParameter['colorHSV'] = [25500, 255, 254];
                } else if($translate.instant('lights.colors.blue') == spokenWords[i]){
                    SaidParameter['colorRGB'] = [0, 0, 255];
                    SaidParameter['colorHSV'] = [46920, 255, 254];
                } else if($translate.instant('lights.colors.yellow') == spokenWords[i]){
                    SaidParameter['colorRGB'] = [255, 255, 0];
                    SaidParameter['colorHSV'] = [10920, 255, 254];
                } else if($translate.instant('lights.colors.orange') == spokenWords[i]){
                    SaidParameter['colorRGB'] = [255, 127, 0];
                    SaidParameter['colorHSV'] = [5460, 255, 254];
                } else if($translate.instant('lights.colors.pink') == spokenWords[i]){
                    SaidParameter['colorRGB'] = [255, 0, 255];
                    SaidParameter['colorHSV'] = [54610, 255, 254];
                } else if($translate.instant('lights.colors.purple') == spokenWords[i]){
                    SaidParameter['colorRGB'] = [127, 0, 127];
                    SaidParameter['colorHSV'] = [54610, 255, 127];
                } else if($translate.instant('lights.colors.white') == spokenWords[i]){
                    SaidParameter['colorRGB'] = [255, 255, 255];
                    SaidParameter['colorHSV'] = [0, 0, 254];
                }

                // Adjust brightness
                if(spokenWords[i] == '100%' || $translate.instant('lights.intensity.max').includes(spokenWords[i])){
                    SaidParameter['brightness'] = 1.0;
                } else if(spokenWords[i] == '10%'){
                    SaidParameter['brightness'] = 0.1;
                } else if(spokenWords[i] == '20%'){
                    SaidParameter['brightness'] = 0.2;
                } else if(spokenWords[i] == '25%' || $translate.instant('lights.intensity.quarter').includes(spokenWords[i])){
                    SaidParameter['brightness'] = 0.25;
                } else if(spokenWords[i] == '30%'){
                    SaidParameter['brightness'] = 0.3;
                } else if(spokenWords[i] == '40%'){
                    SaidParameter['brightness'] = 0.3;
                } else if(spokenWords[i] == '50%' || $translate.instant('lights.intensity.half').includes(spokenWords[i])){
                    SaidParameter['brightness'] = 0.5;
                } else if(spokenWords[i] == '60%'){
                    SaidParameter['brightness'] = 0.6;
                } else if(spokenWords[i] == '70%'){
                    SaidParameter['brightness'] = 0.7;
                } else if(spokenWords[i] == '75%' || $translate.instant('lights.intensity.threequarter').includes(spokenWords[i])){
                    SaidParameter['brightness'] = 0.75;
                } else if(spokenWords[i] == '80%'){
                    SaidParameter['brightness'] = 0.8;
                } else if(spokenWords[i] == '90%'){
                    SaidParameter['brightness'] = 0.9;
                }

                // special mode
                if($translate.instant('lights.action.nightmode').includes(spokenWords[i])){
                    SaidParameter['colorRGB'] = [255, 0, 0];
                    SaidParameter['colorHSV'] = [0, 255, 254];
                    SaidParameter['brightness'] = 0.1
                }

                // reset all LED
                if($translate.instant('lights.action.reset').includes(spokenWords[i])){
                    localStorage.clear()
                }

            }

            // if spoken words contain no location, use all defined locations
            if(SaidParameter['locations'].length == 0){
                for(var i = 0; i < definedLocations.length; i++){
                    SaidParameter['locations'].push(i);
                }
            }

            var SavedSettings = [];

            // get remaining info from local storage
            for(var j = 0 ; j < SaidParameter['locations'].length; j++){
                var i = SaidParameter['locations'][j];
                var SavedSetting = {};
                // read settings from storage or use default
                if(localStorage.getItem('Light_Setup_' + i) == null){
                    SavedSetting['colorRGB'] = [255, 255, 255];
                    SavedSetting['colorHSV'] = [0, 0, 254];
                    SavedSetting['brightness'] = 0.4
                }
                else{
                    SavedSetting = JSON.parse(localStorage.getItem('Light_Setup_' + i));
                }

                // overwrite settings with spoken info
                for(var key in SaidParameter){
                    if(SaidParameter.hasOwnProperty(key)) {
                        SavedSetting[key] = SaidParameter[key];
                    }
                }

                // save new values in local storage
                localStorage.setItem('Light_Setup_' + i, JSON.stringify(SavedSetting));

                SavedSetting['location'] = i;

                SavedSettings.push(SavedSetting);
            }

            SavedSettings.map(updateLights);
        }

        function updateLights(setting){
            var index = setting['location'];
            for(var i = 0; i < config.light.setup[index].targets.length; i++){
                if(config.light.setup[index].targets[i].type == "hyperion"){
                    updateHyperion(i, index, setting);
                }
                else if(config.light.setup[index].targets[i].type == "hue"){
                    updateHue(i, index, setting);
                }
            }
        }

        function updateHyperion(i, index, setting){
            // Convert color and brightness
            for(var j = 0; j <  setting['colorRGB'].length; j++){
                setting['colorRGB'][j] = Math.round(setting['colorRGB'][j] * setting['brightness']);
            }
            // Connect to the configured Hyperion client
            var hyperion = new Hyperion(config.light.setup[index].targets[i].ip, config.light.setup[index].targets[i].port);

            hyperion.on('connect', function(){
                if(setting['on']){
                    hyperion.setColor(setting['colorRGB']);
                }
                else{
                    hyperion.clearall();
                }
            });

            hyperion.on('error', function(error){
                console.error('error:', error);
            });
        }

        function updateHue(i, index, setting){
            var update = {};
            update["transitiontime"] = 10;
            
            update['on'] = setting['on'];
            if(setting['on']){
                update['hue'] = setting['colorHSV'][0];
                update['sat'] = setting['colorHSV'][1];
                update['bri'] = Math.round(setting['colorHSV'][2] * setting['brightness']);
            }

            $http.put('http://' + config.light.settings.hueIp + '/api/' + config.light.settings.hueUsername + "/groups/" + config.light.setup[index].targets[i].id + "/action", update)
            .success(function (data, status, headers) {
                console.log(data);
            })
        }

        return service;
    }

    angular.module('SmartMirror')
        .factory('LightService', LightService);

}());
