(function(angular) {
    'use strict';

    function MirrorCtrl(AnnyangService, GeolocationService, WeatherService, $scope, $timeout) {
        var _this = this;
        $scope.listening = false;
        $scope.complement = "Hi, sexy!"
        $scope.focus = "default";
        $scope.user = {};

        $scope.resizeMap = function(){
            google.maps.event.trigger(map, "resize");
        }
        //Update the time
        var tick = function() {
            $scope.date = new Date();
            $timeout(tick, 1000 * 60);
        };

        _this.init = function() {
            _this.clearResults();
            GeolocationService.getLocation().then(function(geoposition){
                console.log("Geoposition", geoposition);
                WeatherService.init(geoposition).then(function(forcast){
                    console.log("Forcast", forcast);
                });
            })
            tick();

            var defaultView = function() {
                console.debug("Ok, going to default view...");
                $scope.focus = "default";
            }

            // List commands
            AnnyangService.addCommand('What can I say', function() {
                console.debug("Here is a list of commands...");
                console.log(AnnyangService.commands);
                $scope.focus = "commands";
            });

            // Go back to default view
            AnnyangService.addCommand('Go home', defaultView);

            // Hide everything and "sleep"
            AnnyangService.addCommand('Go to sleep', function() {
                console.debug("Ok, going to sleep...");
                $scope.focus = "sleep";
            });

            // Go back to default view
            AnnyangService.addCommand('Wake up', defaultView);

            // Search images
            AnnyangService.addCommand('Show me *term', function(term) {
                console.debug("Showing", term);
            });

            // Change name
            AnnyangService.addCommand('My name is *name', function(name) {
                console.debug("Hi", name, "nice to meet you");
                $scope.user.name = name;
            });

            // Set a reminder
            AnnyangService.addCommand('Remind me to *task', function(task) {
                console.debug("I'll remind you to", task);
            });

            // Clear reminders
            AnnyangService.addCommand('Clear reminders', function() {
                console.debug("Clearing reminders");
            });

            // Clear log of commands
            AnnyangService.addCommand('Clear results', function(task) {
                 console.debug("Clearing results");
                 _this.clearResults()
            });

            // Check the time
            AnnyangService.addCommand('what time is it', function(task) {
                 console.debug("It is", moment().format('h:mm:ss a'));
                 _this.clearResults()
            });

            // Fallback for all commands
            AnnyangService.addCommand('*allSpeach', function(allSpeech) {
                console.debug(allSpeech);
                _this.addResult(allSpeech);
            });
            
            //Track when the Annyang is listening to us
            AnnyangService.start(function(listening){
                $scope.listening = listening;
            });
        };
        
        _this.addResult = function(result) {
            _this.results.push({
                content: result,
                date: new Date()
            });
        };
        
        _this.clearResults = function() {
            _this.results = [];
        };

        _this.init();
    }

    angular.module('SmartMirror')
        .controller('MirrorCtrl', MirrorCtrl);

}(window.angular));


/*
'(show me) help':       help,
    'hello (there)':        hello,
    'stop listening':       stopListening,



    Commands:
        "What Can I Say?": give the user a list of availalbe commands

TODO:
- Set a timer for X

Both the init() and addCommands() methods receive a commands object.

annyang understands commands with named variables, splats, and optional words.

Use named variables for one word arguments in your command.
Use splats to capture multi-word text at the end of your command (greedy).
Use optional words or phrases to define a part of the command as optional.
Examples:

<script>
var commands = {
  // annyang will capture anything after a splat (*) and pass it to the function.
  // e.g. saying "Show me Batman and Robin" will call showFlickr('Batman and Robin');
  'show me *term': showFlickr,

  // A named variable is a one word variable, that can fit anywhere in your command.
  // e.g. saying "calculate October stats" will call calculateStats('October');
  'calculate :month stats': calculateStats,

  // By defining a part of the following command as optional, annyang will respond
  // to both: "say hello to my little friend" as well as "say hello friend"
  'say hello (to my little) friend': greeting
};

var showFlickr = function(term) {
  var url = 'http://api.flickr.com/services/rest/?tags='+tag;
  $.getJSON(url);
}

var calculateStats = function(month) {
  $('#stats').text('Statistics for '+month);
}

var greeting = function() {
  $('#greeting').text('Hello!');
}
</script>
*/ 