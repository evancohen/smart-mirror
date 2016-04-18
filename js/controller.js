(function(angular) {
    'use strict';

    function MirrorCtrl(
            AnnyangService,
            GeolocationService,
            WeatherService,
            MapService,
            HueService,
            CalendarService,
            SearchService,
			SoundCloudService,
      SoundVisualizerService,
            $scope,
            $timeout,
            $interval) {

        var _this = this;
        var DEFAULT_COMMAND_TEXT = 'Say "What can I say?" to see a list of commands...';
        $scope.listening = false;
        $scope.debug = false;
        $scope.complement = "Hi, sexy!"
        $scope.focus = "default";
        $scope.user = {};
        $scope.interimResult = DEFAULT_COMMAND_TEXT;

        //Update the time
        function updateTime(){
            $scope.date = new Date();
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

            //Initiate Hue communication
            HueService.init();

			//Initialize SoundCloud
			var playing = false, sound;
			SoundCloudService.init();

            var refreshMirrorData = function() {
                //Get our location and then get the weather for our location
                GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                    console.log("Geoposition", geoposition);
                    WeatherService.init(geoposition).then(function(){
                        $scope.currentForcast = WeatherService.currentForcast();
                        $scope.weeklyForcast = WeatherService.weeklyForcast();
                        console.log("Current", $scope.currentForcast);
                        console.log("Weekly", $scope.weeklyForcast);
                    });
                }, function(error){
                    console.log("There was a problem:", error);
                });

                CalendarService.renderAppointments().then(function(response) {
                    $scope.calendar = CalendarService.getFutureEvents();
                }, function(error) {
                    console.log(error);
                });
            };

            $timeout(refreshMirrorData(), 3600000);

            //Set the mirror's focus (and reset any vars)
            var setFocus = function(target){
                $scope.focus = target;
                //Stop any videos from playing
                if(target != 'video'){
                    $scope.video = 'http://www.youtube.com/embed/';
                }
                console.log("Video URL:", $scope.video);
            }

            var defaultView = function() {
                console.debug("Ok, going to default view...");
                setFocus("default");
            }

            // List commands
            AnnyangService.addCommand('What can I say', function() {
                console.debug("Here is a list of commands...");
                console.log(AnnyangService.commands);
                setFocus("commands");
            });

            // Go back to default view
            AnnyangService.addCommand('Go home', defaultView);

            // Hide everything and "sleep"
            AnnyangService.addCommand('Go to sleep', function() {
                console.debug("Ok, going to sleep...");
                setFocus("sleep");
            });

            // Go back to default view
            AnnyangService.addCommand('Wake up', defaultView);

            // Hide everything and "sleep"
            AnnyangService.addCommand('Show debug information', function() {
                console.debug("Boop Boop. Showing debug info...");
                $scope.debug = true;
            });

            // Hide everything and "sleep"
            AnnyangService.addCommand('Show (me a) map', function() {
                console.debug("Going on an adventure?");
                setFocus("map");
            });

            // Hide everything and "sleep"
            AnnyangService.addCommand('Show (me a) map of *location', function(location) {
                console.debug("Getting map of", location);
                $scope.map = MapService.generateMap(location);
                setFocus("map");
            });

            // Zoom in map
            AnnyangService.addCommand('(map) zoom in', function() {
                console.debug("Zoooooooom!!!");
                $scope.map = MapService.zoomIn();
            });

            AnnyangService.addCommand('(map) zoom out', function() {
                console.debug("Moooooooooz!!!");
                $scope.map = MapService.zoomOut();
            });

            AnnyangService.addCommand('(map) zoom (to) *value', function(value) {
                console.debug("Moooop!!!", value);
                $scope.map = MapService.zoomTo(value);
            });

            AnnyangService.addCommand('(map) reset zoom', function() {
                console.debug("Zoooommmmmzzz00000!!!");
                $scope.map = MapService.reset();
                setFocus("map");
            });

			//SoundCloud search and play
			AnnyangService.addCommand('SoundCloud play *query', function(query) {
				SoundCloudService.searchSoundCloud(query).then(function(response){
					SC.stream('/tracks/' + response[0].id).then(function(player){
						player.play();
						sound = player;
						playing = true;
					});

					if (response[0].artwork_url){
						$scope.scThumb = response[0].artwork_url.replace("-large.", "-t500x500.");
					} else {
						$scope.scThumb = 'http://i.imgur.com/8Jqd33w.jpg?1';
					}
					$scope.scWaveform = response[0].waveform_url;
					$scope.scTrack = response[0].title;
					$scope.focus = "sc";
          SoundVisualizerService.start();
				});
            });
			//SoundCloud stop
			AnnyangService.addCommand('SoundCloud (pause)(post)(stop)(stock)', function() {
				sound.pause();
        SoundVisualizerService.stop();
        $scope.focus = "default";
            });
			//SoundCloud resume
			AnnyangService.addCommand('SoundCloud (play)(resume)', function() {
				sound.play();
        SoundVisualizerService.start();
        $scope.focus = "sc";
            });
			//SoundCloud replay
			AnnyangService.addCommand('SoundCloud replay', function() {
				sound.seek(0);
				sound.play();
        SoundVisualizerService.start();
        $scope.focus = "sc";
            });

            //Search for a video
            AnnyangService.addCommand('show me (a video)(of)(about) *query', function(query){
                SearchService.searchYouTube(query).then(function(results){
                    //Set cc_load_policy=1 to force captions
                    $scope.video = 'http://www.youtube.com/embed/'+results.data.items[0].id.videoId+'?autoplay=1&controls=0&iv_load_policy=3&enablejsapi=1&showinfo=0';
                    setFocus("video");
                });
            });
            //Stop video
            AnnyangService.addCommand('stop video', function() {
              var iframe = document.getElementsByTagName("iframe")[0].contentWindow;
              iframe.postMessage('{"event":"command","func":"' + 'stopVideo' +   '","args":""}', '*');
              $scope.focus = "default";
            });

            // Change name
            AnnyangService.addCommand('My (name is)(name\'s) *name', function(name) {
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
                 _this.clearResults();
            });

            // Turn lights off
            AnnyangService.addCommand('(turn) (the) :state (the) light(s) *action', function(state, action) {
                HueService.performUpdate(state + " " + action);
            });

            // Fallback for all commands
            AnnyangService.addCommand('*allSpeech', function(allSpeech) {
                console.debug(allSpeech);
                _this.addResult(allSpeech);
            });

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
