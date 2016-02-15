(function() {
    'use strict';

    function HueService($http) {
        var service = {};

        service.init = function() {
            $http.put(HUE_BASE + 'groups/0/action', {
                "on": true,
                "hue": 4000,
                "sat": 0,
                "bri": 250,
                "transitiontime":15,
                "alert":"select",
            })
            .success(function (data, status, headers) {
                console.log(data);
            })
        };

        //Updates a group of Hue lights (Assumes that one group is configured)
        //You can change the group to 0 to perform the updates to all lights
        service.performUpdate = function(spokenWords) {
            //deturmine the updates that we need to perform to the lights
            var update = deturmineUpdates(spokenWords.toLowerCase().split(" "));
            //Parse the update string and see what actions we need to perform
            console.log(update);

            $http.put(HUE_BASE + 'groups/0/action', update)
            .success(function (data, status, headers) {
                console.log(data);
            })
        }

        //Detect any kind of target color
        function deturmineUpdates(spokenWords){
            console.log("Spoken Words:", spokenWords)
            var update = {};

            update["transitiontime"] = 60;

            for(var i = 0; i <= spokenWords.length; i++){
                console.log("Checking word:", spokenWords[i]);
                              
                //Check for color updates
                if(spokenWords[i] == 'red' || spokenWords[i] == 'reed' || spokenWords[i] == 'read'){
                    update["xy"] = [0.674,0.322];
                } else if(spokenWords[i] == 'dark green'){
                    update["xy"] = [0.408,0.517];
                } else if(spokenWords[i] == 'green'){
                    update["xy"] = [0.408,0.517];
                } else if(spokenWords[i] == 'blue'){
                    update["xy"] = [0.168,0.041];
                } else if(spokenWords[i] == 'yellow'){
                    update["xy"] = [0.4317,0.4996];
                } else if(spokenWords[i] == 'orange'){
                    update["xy"] = [0.5562,0.4084];
                } else if(spokenWords[i] == 'pink'){
                    update["xy"] = [0.3824,0.1601];
                } else if(spokenWords[i] == 'purple'){
                    update["xy"] = [0.2725,0.1096];
                } else if(spokenWords[i] == 'White' || spokenWords[i] == 'white' || spokenWords[i] == 'wight'){
                    update["xy"] = [0.3227,0.329];
                } else if(spokenWords[i] == 'movie' || spokenWords[i] == 'cinema' || spokenWords[i] == 'Netflix'){
                    update["xy"] = [0.3227,0.329];
                    update["sat"] = 0;
                    update["bri"] = 15;
                }

                //check for a brightness adjustment
                if(spokenWords[i] == 'up' || spokenWords[i] == 'increase'){
                    update["bri_inc"] = 75;
                } else if(spokenWords[i] == 'down' || spokenWords[i] == 'decrease' || spokenWords[i] == 'lower'){
                    update["bri_inc"] = -75;
                } else if(spokenWords[i] == '100%' || spokenWords[i] == 'intense' || spokenWords[i] == 'max'){
                    update["bri"] = 254;
                } else if(spokenWords[i] == 'dim' || spokenWords[i] == 'gentle' || spokenWords[i] == '' || spokenWords[i] == 'soft' || spokenWords[i] == 'lower'){
                    update["bri"] = 1;
                } else if(spokenWords[i] == '10%'){
                    update["bri"] = 10;
                } else if(spokenWords[i] == '20%'){
                    update["bri"] = 20;
                } else if(spokenWords[i] == '25%'){
                    update["bri"] = 25;
                } else if(spokenWords[i] == '30%'){
                    update["bri"] = 30;
                } else if(spokenWords[i] == '40%'){
                    update["bri"] = 40;
                } else if(spokenWords[i] == '50%'){
                    update["bri"] = 50;
                } else if(spokenWords[i] == '60%'){
                    update["bri"] = 60;
                } else if(spokenWords[i] == '70%'){
                    update["bri"] = 70;
                } else if(spokenWords[i] == '80%'){
                    update["bri"] = 80;
                } else if(spokenWords[i] == '75%'){
                    update["bri"] = 75;
                } else if(spokenWords[i] == '90%'){
                    update["bri"] = 90;
                } else if(spokenWords[i] == '100%'){
                    update["bri"] = 100;
                }

                //are we turning the lights on or off?
                if(spokenWords[i] == 'on'){
                    update["on"] = true;
                    //for some reason we are forgetting the brightness
                    update["bri"] = 250;
                } else if(spokenWords[i] == 'off' || spokenWords[i] == 'out'){
                    update["on"] = false;
                }
            }
            return update;
        }
        return service;
    }
    
    angular.module('SmartMirror')
        .factory('HueService', HueService);

}());
