(function() {
    'use strict';

    function HueService($http, $translate) {
        var service = {};
        //Updates a group of Hue lights (Assumes that one group is configured)
        //You can change the group to 0 to perform the updates to all lights
        service.performUpdate = function(spokenWords) {
            var spokenWordsArray = spokenWords.toLowerCase().split(" ");
            //deturmine the updates that we need to perform to the lights
            var update = deturmineUpdates(spokenWordsArray);
            // Deturmine which light to swith on/off
            var light = deturmineLight(spokenWordsArray);
            //Parse the update string and see what actions we need to perform
            console.log("Updating hue group [" + light + "]:", update);

            $http.put('http://' + config.hue.ip + '/api/' + config.hue.uername + "/groups/" + light + "/action", update)
            .success(function (data, status, headers) {
                console.log(data);
            })
        }

        //Detect any kind of target color
        function deturmineUpdates(spokenWords){
            var update = {};

            update["transitiontime"] = 10;

            for(var i = 0; i < spokenWords.length; i++){

                //Check for color updates
                if($translate.instant('lights.colors.red') == spokenWords[i]){
                    update["xy"] = [0.674,0.322];
                } else if($translate.instant('lights.colors.dark_green') == spokenWords[i]){
                    update["xy"] = [0.408,0.517];
                } else if($translate.instant('lights.colors.green') == spokenWords[i]){
                    update["xy"] = [0.408,0.517];
                } else if($translate.instant('lights.colors.blue') == spokenWords[i]){
                    update["xy"] = [0.168,0.041];
                } else if($translate.instant('lights.colors.yellow') == spokenWords[i]){
                    update["xy"] = [0.4317,0.4996];
                } else if($translate.instant('lights.colors.orange') == spokenWords[i]){
                    update["xy"] = [0.5562,0.4084];
                } else if($translate.instant('lights.colors.pink') == spokenWords[i]){
                    update["xy"] = [0.3824,0.1601];
                } else if($translate.instant('lights.colors.purple') == spokenWords[i]){
                    update["xy"] = [0.2725,0.1096];
                } else if($translate.instant('lights.colors.white') == spokenWords[i]){
                    update["xy"] = [0.3227,0.329];
                } else if($translate.instant('lights.colors.movie') == spokenWords[i]){
                    update["xy"] = [0.3227,0.329];
                    update["sat"] = 0;
                    update["bri"] = 15;
                } else if($translate.instant('lights.colors.colorloop') == spokenWords[i]){
                    update["effect"] = "colorloop";
                } else if($translate.instant('lights.colors.stop') == spokenWords[i]){
                    update["effect"] = "none";
                    update["xy"] = [0.3227,0.329];
                    update["sat"] = 0;
                    update["bri"] = 255;
                }

                //check for a brightness adjustment
                if(spokenWords[i] == '10'){
                    update["bri"] = 26;
                } else if(spokenWords[i] == '20'){
                    update["bri"] = 51;
                } else if(spokenWords[i] == '25'){
                    update["bri"] = 64;
                } else if(spokenWords[i] == '30'){
                    update["bri"] = 77;
                } else if(spokenWords[i] == '40'){
                    update["bri"] = 102;
                } else if(spokenWords[i] == '50'){
                    update["bri"] = 128;
                } else if(spokenWords[i] == '60'){
                    update["bri"] = 153;
                } else if(spokenWords[i] == '70'){
                    update["bri"] = 179;
                } else if(spokenWords[i] == '75'){
                    update["bri"] = 191;
                } else if(spokenWords[i] == '80'){
                    update["bri"] = 204;
                } else if(spokenWords[i] == '90'){
                    update["bri"] = 230;
                } else if(spokenWords[i] == '100'){
                    update["bri"] = 255;
                } else if($translate.instant('lights.intensity.increase') == spokenWords[i]){
                    update["bri_inc"] = 51; // 20%
                } else if($translate.instant('lights.intensity.decrease') == spokenWords[i]){
                    update["bri_inc"] = -51; // 20%
                } else if($translate.instant('lights.intensity.max') == spokenWords[i]){
                    update["bri"] = 254;
                }

                //are we turning the lights on or off?
                if($translate.instant('lights.action.on') == spokenWords[i]){
                    update["on"] = true;
                    update["bri"] = 250;
                } else if($translate.instant('lights.action.off') == spokenWords[i]){
                    update["on"] = false;
                }
            }
            return update;
        }

        // Detect light
        // TODO make this return an array of groups to update
        function deturmineLight(spokenWords){
            for(var i = 0; i < spokenWords.length; i++){
                for (var j = 0; j < config.hue.groups.length; j++){
                    if (spokenWords[i] == config.hue.groups[j].name){
                        return j;
                    }
                }
            }
            return 0;
        }
        return service;
    }

    angular.module('SmartMirror')
        .factory('HueService', HueService);

}());
