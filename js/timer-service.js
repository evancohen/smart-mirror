(function(angular){
  'use strict';

  /**
   * Parse spoken duration into seconds
   * @param  {String} string - e.g.: `1 minute` or `5 minutes and 10 seconds`
   * @return {Number}        - duration in seconds
   */
	var parseDuration = function(string) {
    var pattern = '([0-9]*) ((?:hour|minute|second)(?:s)?)';
    var matches = string.match(new RegExp(pattern, 'ig'));
    var duration = moment.duration(0);
    for (var i = 0; i < matches.length; i++) {
      var match = matches[i].match(pattern);
      if (match.length) duration.add(parseInt(match[1], 10), match[2]);
    }
    return duration.asSeconds();
  };

  /**
   * Factory function for the timer service
   */
  var TimerService = function($rootScope, $interval){
    var service = {};
    service.running = false;
    service.duration = 0;
    service.countdown = service.duration;

    var intervalId;
    var startTimer = function(){
      service.running = true;
      return $interval(function(){
        service.countdown--;
      }, 1000);
    };

		service.start = function(duration){
      if (angular.isDefined(duration)){
        if (isNaN(duration)){
        	duration = parseDuration(duration);
        }
        if (service.running){
          service.reset();
        }
        service.countdown = duration;
        service.duration = duration;
        $rootScope.$broadcast("timer:init", duration);
      }
      if (angular.isUndefined(intervalId) && service.countdown > 0) {
        intervalId = startTimer();
        $rootScope.$broadcast("timer:start", service.countdown);
      }
    };

    service.stop = function(){
      if (angular.isDefined(intervalId)){
        $interval.cancel(intervalId);
        intervalId = undefined;

        $rootScope.$broadcast("timer:stop");
      }
    };

		service.reset = function(){
      service.running = false;
      service.countdown = 0;
      service.stop();

      $rootScope.$broadcast("timer:reset");
    };

    return service;
	}

  /**
   * Filter for parsing seconds to date
   */
  var secondsToDateTime = function() {
    return function(seconds) {
      return new Date(1970, 0, 1).setSeconds(seconds);
    };
  };

  /**
   * Directive for the svg circle
   */
  var TimerCircle = function(){
  	return {
    	replace: true,
      template: '<svg><circle></circle></svg>',
      link: function(scope, element, attrs){
        var circle = angular.element(element[0].querySelector('circle'));

        scope.$on('timer:init', function(event, duration){
          circle.css({
            'animation-play-state': 'paused',
            'animation-duration': duration + 's'
          });
        	console.debug('timer:init', duration);
        });

        scope.$on('timer:start', function(event, countdown){
          var current = circle.css('animation-duration').slice(0, -1);
          circle.css({
            'display': 'none',
            'animation-delay': -(current - countdown) + 's',
        	  'animation-play-state': 'running'
          });

          circle[0].offsetHeight;   // trigger reflow to reset the animation

          setTimeout(function() {
            circle.css('display', 'block');
          }, 0);

        	console.debug('timer:start');
        });

        scope.$on('timer:stop', function(){
        	circle.css('animation-play-state', 'paused');
        	console.debug('timer:stop');
        });
      }
    };
  };

  angular.module('SmartMirror')
    .factory('TimerService', TimerService)
    .filter('secondsToDateTime', secondsToDateTime)
    .directive('timerCircle', TimerCircle);

}(window.angular));
