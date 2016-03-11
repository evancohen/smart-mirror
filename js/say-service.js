var say = require('say');
(function(say) {
    'use strict';
    //var SayService = require('say'); // Text to speech
    //say.speak('Hello!');
    function SayService() {
        var service = {};

        console.log(say);

        // function speak() {
        //     say.speak('Hello!');
        //     console.log('speak working');
        // }

        function speak(words){
             say.speak(words);
             console.log('speak working');
        }

        return {
            speak
        };
    }
    angular.module('SmartMirror').factory('SayService', SayService);
}(window.say));