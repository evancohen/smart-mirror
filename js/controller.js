(function(angular) {
    'use strict';

    function MirrorCtrl(
<<<<<<< HEAD
            AnnyangService,
            GeolocationService,
            WeatherService,
            MapService,
            HueService,
            CalendarService,
            ComicService,
            GiphyService,
            TrafficService,
            $scope, $timeout, $interval, tmhDynamicLocale) {
=======
            AnnyangService, 
            GeolocationService, 
            WeatherService, 
            MapService, 
            HueService, 
            CalendarService, 
            SearchService,
			SoundCloudService,
            $scope, 
            $timeout, 
            $interval) {
                
>>>>>>> upstream/search
        var _this = this;
        var DEFAULT_COMMAND_TEXT = 'Say "What can I say?" to see a list of commands...';
        $scope.listening = false;
        $scope.debug = false;
        $scope.focus = "default";
        $scope.user = {};
        $scope.interimResult = DEFAULT_COMMAND_TEXT;

<<<<<<< HEAD
        $scope.layoutName = 'main';

        //set lang
        tmhDynamicLocale.set(config.language);
        moment.locale(config.language);


        $scope.dateFormat = config.dateFormat;
        $scope.calcDateFormat = config.calendar.dateFormat;
=======
>>>>>>> upstream/search
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
            GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                console.log("Geoposition", geoposition);
                $scope.map = MapService.generateMap(geoposition.coords.latitude+','+geoposition.coords.longitude);
            });
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
                        $scope.hourlyForcast = WeatherService.hourlyForcast();
                        console.log("Current", $scope.currentForcast);
                        console.log("Weekly", $scope.weeklyForcast);
                        console.log("Hourly", $scope.hourlyForcast);

                        var skycons = new Skycons({"color": "#aaa"});
                        skycons.add("icon_weather_current", $scope.currentForcast.iconAnimation);

                        skycons.play();

                        $scope.iconLoad = function (elementId, iconAnimation){
                            console.log(iconAnimation);
                            skycons.add(document.getElementById(elementId), iconAnimation);
                            skycons.play();
                        };

                    });
<<<<<<< HEAD


                }, function(error){
                    console.log(error);
                });

                CalendarService.getCalendarEvents().then(function(response) {
=======
                }, function(error){
                    console.log("There was a problem:", error);
                });

                CalendarService.renderAppointments().then(function(response) {
>>>>>>> upstream/search
                    $scope.calendar = CalendarService.getFutureEvents();
                }, function(error) {
                    console.log(error);
                });

            };

<<<<<<< HEAD
            refreshMirrorData();
            $interval(refreshMirrorData, 1500000);

            var greetingUpdater = function () {
                if(!Array.isArray(config.greeting) && typeof config.greeting.midday != 'undefined') {
                    var geetingTime = "midday";

                    if (moment().hour() > 4 && moment().hour() < 11) {
                        geetingTime = "morning";
                    } else if (moment().hour() > 18 && moment().hour() < 23) {
                        geetingTime = "evening";
                    } else if (moment().hour() >= 23 || moment().hour() < 4) {
                        geetingTime = "night";
                    }

                    $scope.greeting = config.greeting[geetingTime][Math.floor(Math.random() * config.greeting.morning.length)];
                }else if(Array.isArray(config.greeting)){
                    $scope.greeting = config.greeting[Math.floor(Math.random() * config.greeting.length)];
                }
            };
            greetingUpdater();
            $interval(greetingUpdater, 120000);

            var refreshTrafficData = function() {
                TrafficService.getTravelDuration().then(function(durationTraffic) {
                    console.log("Traffic", durationTraffic);
                    $scope.traffic = {
                        destination:config.traffic.name,
                        hours : durationTraffic.hours(),
                        minutes : durationTraffic.minutes()
                    };
                }, function(error){
                    $scope.traffic = {error: error};
                });
            };

            refreshTrafficData();
            $interval(refreshTrafficData, config.traffic.reload_interval * 60000);

            var refreshComic = function () {
            	console.log("Refreshing comic");
            	ComicService.initDilbert().then(function(data) {
            		console.log("Dilbert comic initialized");
            	}, function(error) {
            		console.log(error);
            	});
            };

            refreshComic();
            $interval(refreshComic, 12*60*60000); // 12 hours
=======
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
>>>>>>> upstream/search

            var defaultView = function() {
                console.debug("Ok, going to default view...");
                setFocus("default");
            }


            //AnnyangService.setLanguage('de-DE');

            // List commands
            AnnyangService.addCommand('What can I say', function() {
                console.debug("Here is a list of commands...");
                //text to speech
                if(responsiveVoice.voiceSupport()) {
                  responsiveVoice.speak("Here is a list of commands...","US English Male");
                }
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
            AnnyangService.addCommand('Wake up', function(){
                defaultView();
            });

            // Hide everything and "sleep"
            AnnyangService.addCommand('Show debug information', function() {
                console.debug("Boop Boop. Showing debug info...");
                $scope.debug = true;
            });

            // Hide everything and "sleep"
            AnnyangService.addCommand('Show (me a) map', function() {
                console.debug("Going on an adventure?");
<<<<<<< HEAD
                GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                    console.log("Geoposition", geoposition);
                    $scope.map = MapService.generateMap(geoposition.coords.latitude+','+geoposition.coords.longitude);
                    $scope.focus = "map";
                });
             });
=======
                setFocus("map");
            });
>>>>>>> upstream/search

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
				});
            });
			//SoundCloud stop
			AnnyangService.addCommand('SoundCloud (pause)(post)(stop)(stock)', function() {
				sound.pause();
            });
			//SoundCloud resume
			AnnyangService.addCommand('SoundCloud (play)(resume)', function() {
				sound.play();
            });
			//SoundCloud replay
			AnnyangService.addCommand('SoundCloud replay', function() {
				sound.seek(0);
				sound.play();
            });
			
            //Search for a video
            AnnyangService.addCommand('show me (a video)(of)(about) *query', function(query){
                SearchService.searchYouTube(query).then(function(results){
                    //Set cc_load_policy=1 to force captions
                    $scope.video = 'http://www.youtube.com/embed/'+results.data.items[0].id.videoId+'?autoplay=1&controls=0&iv_load_policy=3&enablejsapi=1&showinfo=0';
                    setFocus("video");
                });
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

            // Check the time
            AnnyangService.addCommand('what time is it', function(task) {
                 console.debug("It is", moment().format('h:mm:ss a'));
            });

            // Turn lights off
            AnnyangService.addCommand('(turn) (the) :state (the) light(s) *action', function(state, action) {
                HueService.performUpdate(state + " " + action);
            });

            //Show giphy image
            AnnyangService.addCommand('giphy *img', function(img) {
                GiphyService.init(img).then(function(){
                    $scope.gifimg = GiphyService.giphyImg();
                    $scope.focus = "gif";
                });
            });

            // Show xkcd comic
            AnnyangService.addCommand('Show xkcd', function(state, action) {
                console.debug("Fetching a comic for you.");
                ComicService.getXKCD().then(function(data){
                    $scope.xkcd = data.img;
                    $scope.focus = "xkcd";
                });
            });

            // Show Dilbert comic
            AnnyangService.addCommand('Show Dilbert (comic)', function(state, action) {
                console.debug("Fetching a Dilbert comic for you.");
                $scope.dilbert = ComicService.getDilbert("today");  // call it with "random" for random comic
                $scope.focus = "dilbert";
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

        _this.init();
    }

    angular.module('SmartMirror')
        .controller('MirrorCtrl', MirrorCtrl);




    function themeController($scope) {

        var layoutName = 'main';
        if(typeof config.layout != 'undefined' && config.layout){
            layoutName = config.layout;
        }

        $scope.layoutName = layoutName;


        var angularLang = 'en';
        if(typeof config.language != 'undefined' && config.language){
            angularLang = config.language;
        }

        $scope.angularLang = angularLang;
    }

    angular.module('SmartMirror')
        .controller('Theme', themeController);

}(window.angular));
