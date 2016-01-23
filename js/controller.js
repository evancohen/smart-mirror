(function(angular) {
    'use strict';

    function MirrorCtrl(AnnyangService, GeolocationService, WeatherService, MapService, TrafficService, CalendarService, HueService, $scope, $timeout, $interval) {
        var _this = this;
        var DEFAULT_COMMAND_TEXT = 'Dont know what to say? Just ask!';
        $scope.listening = false;
        $scope.debug = false;
        $scope.complement = "Hi..."
        $scope.focus = "default";
        $scope.user = {};
        $scope.interimResult = DEFAULT_COMMAND_TEXT;
//todostuff
        $scope.addTodo = function(){
          $scope.todos.push({
            name      : $scope.newTodo,
            completed : false
          });
        }
        var todos = [
            {
                name      : '',
                completed : false
              }
              ];

        $scope.todos = todos;

              		function wordsToNumber(words){
              			switch(words)
              			{
              				case "one" :
              					return 1;
              					break;
              				case "two" :
              					return 2;
              					break;
              				case "three" :
              					return 3;
              					break;
              				case "four" :
              					return 4;
              					break;
              				case "five" :
              					return 5;
              					break;
              				case "six" :
              					return 6;
              					break;
              			}
              		}

              		$scope.deleteTodo = function(index){
              			$scope.todos.splice(index, 0);
              		}

              		$scope.checkTodo = function(number){
              				$scope.todos[number-0].completed = true;

              		}

              		$scope.clearCompleted = function(){
              			$scope.todos = $scope.todos.filter(function(item){
              				return !item.completed
              			})
              		}
        $scope.colors=["#6ed3cf", "#9068be", "#e1e8f0", "#e62739"];
        //ToDoController


        //Update the time
        function updateTime(){
            $scope.date = new Date();
        }


        var setWeather = function() {
          WeatherService.refreshWeather();
          $scope.currentForcast = WeatherService.currentForcast();
          $scope.weeklyForcast = WeatherService.weeklyForcast();
        }

        // Reset the command text
        var restCommand = function(){
          $scope.interimResult = DEFAULT_COMMAND_TEXT;
        }

        _this.init = function() {
            var tick = $interval(updateTime, 1000);
            updateTime();
            $scope.map = MapService.generateMap("Seattle,WA");

            _this.clearResults();
            restCommand();

            //Get our location and then get the weather for our location
            GeolocationService.getLocation().then(function(geoposition){
                console.log("Geoposition", geoposition);
                WeatherService.init(geoposition).then(function(){
                    $scope.currentForcast = WeatherService.currentForcast();
                    $scope.weeklyForcast = WeatherService.weeklyForcast();
                    console.log("Current", $scope.currentForcast);
                    console.log("Weekly", $scope.weeklyForcast);
                    //refresh the weather every hour
                    //this doesn't acutually updat the UI yet
                    $timeout(setWeather(), 3600000);
                });
            });

            var promise = CalendarService.renderAppointments();
            promise.then(function(response) {
              $scope.appointments = CalendarService.getFutureEvents();
            }, function(errorMsg) {
              console.log(errorMsg);
            });

            //Initiate Hue communication
            HueService.init();

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
            //Add new reminder
            AnnyangService.addCommand('don\'t forget *val', function(val) {
                console.debug("Set a reminder..");
                console.log(AnnyangService.commands);
                $scope.newTodo   = val;
                $scope.completed = false;
                $scope.addTodo();
                $scope.$apply();
            });
            //Check list item
            AnnyangService.addCommand('Item *val is done', function(val) {
                console.debug("Marked item *val as complete, well done!");
                console.log(AnnyangService.commands);
                $scope.checkTodo(val);
          			$scope.$apply();
            });
            //Tidy Up Completed Items
            AnnyangService.addCommand('clear completed items', function(val) {
                console.debug("Clearing completed items from to do list");
                console.log(AnnyangService.commands);
                $scope.clearCompleted();
        				$scope.$apply();
            });
            // Go back to default view
            AnnyangService.addCommand('Go home', defaultView);

            // Hide everything and "sleep"
            AnnyangService.addCommand('Bye', function() {
                console.debug("Ok, going to sleep...");
                $scope.focus = "sleep";
            });

            // Wakes up mirror
            AnnyangService.addCommand('Hi', defaultView);

            // Shows debug button
            AnnyangService.addCommand('Show debug information', function() {
                console.debug("Boop Boop. Showing debug info...");
                $scope.debug = true;
            });

            AnnyangService.addCommand('Show traffic', function() {
                console.debug("Going on an adventure?");
                GeolocationService.getLocation().then(function(geoposition){
                  $scope.map = TrafficService.generateMap(geoposition);
                });
                $scope.focus = "map";
            });

            // Shows map of set home
            AnnyangService.addCommand('Show map', function() {
                console.debug("Going on an adventure?");
                $scope.focus = "map";
            });

            // Shows map of selected area
            AnnyangService.addCommand('Show (me a) map of *location', function(location) {
                console.debug("Getting map of", location);
                $scope.map = MapService.generateMap(location);
                $scope.focus = "map";
            });

            // Zoom in map
            AnnyangService.addCommand('(map) zoom in', function() {
                console.debug("Zoooooooom!!!");
                $scope.map = MapService.zoomIn();
            });
            // Zoom out map
            AnnyangService.addCommand('(map) zoom out', function() {
                console.debug("Moooooooooz!!!");
                $scope.map = MapService.zoomOut();
            });
            // Zoom map to percentage value
            AnnyangService.addCommand('(map) zoom (to) *value', function(value) {
                console.debug("Moooop!!!", value);
                $scope.map = MapService.zoomTo(value);
            });
            // Reset maps zoom
            AnnyangService.addCommand('(map) reset zoom', function() {
                console.debug("Zoooommmmmzzz00000!!!");
                $scope.map = MapService.reset();
                $scope.focus = "map";
            });

            // Search images
            AnnyangService.addCommand('Show me *term', function(term) {
                console.debug("Showing", term);
            });

            // Change name
            AnnyangService.addCommand('My (name is)(name\'s) *name', function(name) {
                console.debug("Hi", name, "nice to meet you");
                $scope.user.name = name;
            });

            // Set a reminder
            AnnyangService.addCommand('dont forget *task', function(task) {
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
                 _this.clearResults();
            });

            // Turn lights off
            AnnyangService.addCommand('(turn) (the) :state (the) light(s) *action', function(state, action) {
                HueService.performUpdate(state + " " + action);
            });

            // Fallback for all commands
            //AnnyangService.addCommand('*allSpeech', function(allSpeech) {
            //    console.debug(allSpeech);
            //    _this.addResult(allSpeech);
            //});

            var resetCommandTimeout;
            //Track when the Annyang is listening to us
            AnnyangService.start(function(listening){
                $scope.listening = listening;
            }, function(interimResult){
                $scope.interimResult = interimResult;
                $timeout.cancel(resetCommandTimeout);
            }, function(result){
                $scope.interimResult = result[0];
                resetCommandTimeout = $timeout(restCommand, 5000);
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
