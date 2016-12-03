  (function() {
    'use strict';
    
    // use say for tts
    var say = require('say');

    // Gets time in 12-hour format
    function getTime(timeFormat) {
      var currentTime = new Date();
      var hours = currentTime.getHours();
      var minutes = currentTime.getMinutes();
      var time = "The time is ";

      // 24 hour
      if (timeFormat == "24") {
        time += hours + ":" + minutes;
      }

      // 12 hour
      else {
        if (minutes < 10) {
          minutes = "0" + minutes;
        }

        else if (hours > 11) {
          if (hours != 12) {
            hours = hours - 12;
          }
          time += hours + ":" + minutes + " " + "PM";
        }

        else { // hours <= 11
          time += hours + ":" + minutes + " " + "AM";
        }
      }

      return time;
    }


    function TimeService() {
        var service = {};
        service.speakTime = function(timeFormat) {
          say.speak(getTime(timeFormat));
          // say.speak(getTime(), 'voice_kal_diphone', 0.5); // Can change parameters to use a different voice or change the speed
        };
        return service; // donezo
    }

    angular.module('SmartMirror')
      .factory('TimeService', TimeService);
  }());
