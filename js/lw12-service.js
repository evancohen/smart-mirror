(function() {
    'use strict';

    function LW12Service(PythonService) {
        var service = {};

        //Updates a group of Hue lights (Assumes that one group is configured)
        //You can change the group to 0 to perform the updates to all lights
        service.performUpdate = function(spokenWords) {
            //deturmine the updates that we need to perform to the lights
            var update = deturmineUpdates(spokenWords.toLowerCase().split(" "));
            //Parse the update string and see what actions we need to perform
            console.log("Passing parameters to shell script: " + update);
            if (typeof update !== 'undefined'){ //If update exists...
                PythonService.runScript('python /home/pi/smart-mirror/telnet-sender.py "' + update + '"'); //run the update
            }
        }

        //Detect any kind of target color
        function deturmineUpdates(spokenWords) {
            console.log("Spoken Words:", spokenWords)
            var update = {};
            var command = "";
            var devicename = "myroom"; // Change this for the device you want to edit. This is set in FHEM
            update["ramp"] = 3; // time in seconds for transition
            update["updownvalue"] = 10; // Amount in percent how much the light should be dimmed up or down.

            for (var i = 0; i <= spokenWords.length; i++) {
                console.log("Checking word:", spokenWords[i]);

                //Check for color updates
                if (spokenWords[i] == 'red' || spokenWords[i] == 'reed' || spokenWords[i] == 'read') {
                    update["h"] = 1;
                    update["s"] = 100; //Set default Saturation to 100%
                    update["v"] = 30; //Set Default brightness

                } else if (spokenWords[i] == 'dark green') {
                    update["h"] = 94;
                    update["s"] = 100; //Set default Saturation to 100%
                    update["v"] = 30; //Set Default brightness                    
                } else if (spokenWords[i] == 'green') {
                    update["h"] = 115;
                    update["s"] = 100; //Set default Saturation to 100%
                    update["v"] = 30; //Set Default brightness                    
                } else if (spokenWords[i] == 'blue') {
                    update["h"] = 222;
                    update["s"] = 100; //Set default Saturation to 100%
                    update["v"] = 30; //Set Default brightness                    
                } else if (spokenWords[i] == 'yellow') {
                    update["h"] = 53;
                    update["s"] = 100; //Set default Saturation to 100%
                    update["v"] = 30; //Set Default brightness                    
                } else if (spokenWords[i] == 'orange') {
                    update["h"] = 13;
                    update["s"] = 100; //Set default Saturation to 100%
                    update["v"] = 30; //Set Default brightness                    
                } else if (spokenWords[i] == 'pink') {
                    update["h"] = 322;
                    update["s"] = 100; //Set default Saturation to 100%
                    update["v"] = 30; //Set Default brightness                    
                } else if (spokenWords[i] == 'purple') {
                    update["h"] = 305;
                    update["s"] = 100; //Set default Saturation to 100%
                    update["v"] = 30; //Set Default brightness                    
                } else if (spokenWords[i] == 'White' || spokenWords[i] == 'white' || spokenWords[i] == 'wight') { //Sets the color to all-whight
                    update["h"] = 1;
                    update["s"] = 1;
                    update["v"] = 100;
                } else if (spokenWords[i] == 'movie' || spokenWords[i] == 'cinema' || spokenWords[i] == 'Netflix') { //Turns the movie setting on
                    update["h"] = 13;
                    update["s"] = 1;
                    update["v"] = 15;
                }

                //check for a brightness adjustment
                if (spokenWords[i] == '100%' || spokenWords[i] == 'intense' || spokenWords[i] == 'max') {
                    update["v"] = 100;
                } else if (spokenWords[i] == '10%') {
                    update["v"] = 10;
                } else if (spokenWords[i] == '20%') {
                    update["v"] = 20;
                } else if (spokenWords[i] == '25%') {
                    update["v"] = 25;
                } else if (spokenWords[i] == '30%') {
                    update["v"] = 30;
                } else if (spokenWords[i] == '40%') {
                    update["v"] = 40;
                } else if (spokenWords[i] == '50%') {
                    update["v"] = 50;
                } else if (spokenWords[i] == '60%') {
                    update["v"] = 60;
                } else if (spokenWords[i] == '70%') {
                    update["v"] = 70;
                } else if (spokenWords[i] == '75%') {
                    update["v"] = 75;
                } else if (spokenWords[i] == '80%') {
                    update["v"] = 80;
                } else if (spokenWords[i] == '90%') {
                    update["v"] = 90;
                } else if (spokenWords[i] == '100%') {
                    update["v"] = 100;
                }

                // Set the command for the script
                //are we turning the lights on or off?
                if (spokenWords[i] == 'on') { // We are turning lights on
                    command = "set " + devicename + " on";
                    console.log("Turn lights on");
                } else if (spokenWords[i] == 'off' || spokenWords[i] == 'out') { //We are turning lights off
                    command = "set " + devicename + " off";
                    console.log("Turn lights off");
                } else if (typeof update["h"] == 'undefined' && update["v"]) { //If we want to dim the lights to a specific value only
                    console.log("Dim lights to value");
                    command = "set " + devicename + " dim " + update["v"] + " " + update["ramp"];
                } else if (spokenWords[i] == 'up' || spokenWords[i] == 'increase') { //If we want to make the lights brighter
                    command = "set " + devicename + " dimup " +update["updownvalue"];
                    console.log("Make lights brighter");
                } else if (spokenWords[i] == 'down' || spokenWords[i] == 'decrease' || spokenWords[i] == 'lower') { //If we want to make the lights less bright
                    command = "set " + devicename + " dimdown " +update["updownvalue"];
                    console.log("Make lights darker");
                } else if (typeof update["h"] !== 'undefined' || typeof update["s"] !== 'undefined' || typeof update["v"] !== 'undefined'){ //If we want to change the color
                    command = "set " + devicename + " HSV " + update["h"] + "," + update["s"] + "," + update["v"] + " " + update["ramp"];
                    console.log("Change light color");
                }
                console.log("Command: " + command);
            }
            return command;
        }
        return service;
    }

    angular.module('SmartMirror')
        .factory('LW12Service', LW12Service);

}());