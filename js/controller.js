(function(angular) {
    'use strict';

    function MirrorCtrl(
            AnnyangService,
            SayService,
            GeolocationService,
            WeatherService,
            MapService,
            HueService,
            CalendarService,
            ComicService,
            GiphyService,
            TrafficService,
            $scope, $timeout, $interval, tmhDynamicLocale) {
        var _this = this;
        var DEFAULT_COMMAND_TEXT = 'Say "What can I say?" to see a list of commands...';
        $scope.listening = false;
        $scope.debug = false;
        $scope.focus = "default";
        $scope.user = {};
        $scope.commands = commands
        $scope.interimResult = DEFAULT_COMMAND_TEXT;

        $scope.layoutName = 'main';

        //set lang
        $scope.locale = config.language;
        tmhDynamicLocale.set(config.language.toLowerCase());
        moment.locale(config.language);
        console.log('moment local', moment.locale());
        
        //Update the time
        function updateTime(){
            $scope.date = new moment();
        }

        // Reset the command text
        var restCommand = function(){
          $scope.interimResult = DEFAULT_COMMAND_TEXT;
        }

        _this.init = function() {
            console.log(SayService.speak('Welcome'));
            var tick = $interval(updateTime, 1000);
            updateTime();
            GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                console.log("Geoposition", geoposition);
                $scope.map = MapService.generateMap(geoposition.coords.latitude+','+geoposition.coords.longitude);
            });
            restCommand();

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
                            skycons.add(document.getElementById(elementId), iconAnimation);
                            skycons.play();
                        };

                    });


                }, function(error){
                    console.log(error);
                });

                CalendarService.getCalendarEvents().then(function(response) {
                    $scope.calendar = CalendarService.getFutureEvents();
                }, function(error) {
                    console.log(error);
                });

            };

            refreshMirrorData();
            $interval(refreshMirrorData, 1500000);

            var greetingUpdater = function () {
                if(!Array.isArray(config.greeting) && typeof config.greeting.midday != 'undefined') {
                    var hour = moment().hour();
                    var geetingTime = "midday";

                    if (hour > 4 && hour < 11) {
                        geetingTime = "morning";
                    } else if (hour > 18 && hour < 23) {
                        geetingTime = "evening";
                    } else if (hour >= 23 || hour < 4) {
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
                        destination: config.traffic.name,
                        duration : durationTraffic
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

            var defaultView = function() {
                console.debug("Ok, going to default view...");
                SayService.speak("Ok, going to default view...");
                $scope.focus = "default";
            }

            //AnnyangService.setLanguage('de-DE');

            // List commands
            AnnyangService.addCommand(commands['list']['voice'], function() {
                console.debug("Here is a list of commands...");
                SayService.speak("OK, Here is a list of commands...");
                console.log(AnnyangService.commands);
                $scope.focus = "commands";
            });

            // Go back to default view

            AnnyangService.addCommand(commands['home']['voice'], defaultView);

            // Hide everything and "sleep"
            AnnyangService.addCommand(commands['sleep']['voice'], function() {
                console.debug("Ok, going to sleep...");
                SayService.speak("Ok, going to sleep...");
                $scope.focus = "sleep";
            });

            // Go back to default view
            AnnyangService.addCommand(commands['wake_up']['voice'], function(){
                defaultView();
            });

            // Hide everything and "sleep"
            AnnyangService.addCommand(commands['debug']['voice'], function() {
                console.debug("Boop Boop. Showing debug info...");
                $scope.debug = true;
            });

            // Show map
            AnnyangService.addCommand(commands['map_show']['voice'], function() {
                console.debug("Going on an adventure?");
                SayService.speak("Ok, showig map...");
                GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                    console.log("Geoposition", geoposition);
                    $scope.map = MapService.generateMap(geoposition.coords.latitude+','+geoposition.coords.longitude);
                    $scope.focus = "map";
                });
             });

            // Hide everything and "sleep"
            AnnyangService.addCommand(commands['map_location']['voice'], function(location) {
                console.debug("Getting map of", location);
                SayService.speak("Ok, Getting map of", location);
                $scope.map = MapService.generateMap(location);
                $scope.focus = "map";
            });

            // Zoom in map
            AnnyangService.addCommand(commands['map_zoom_in']['voice'], function() {
                console.debug("Zoooooooom!!!");
                SayService.speak("Ok, zoom in ");
                $scope.map = MapService.zoomIn();
            });

            AnnyangService.addCommand(commands['map_zoom_out']['voice'], function() {
                console.debug("Moooooooooz!!!");
                SayService.speak("Ok, zoom out ");
                $scope.map = MapService.zoomOut();
            });

            AnnyangService.addCommand(commands['map_zoom_point']['voice'], function(value) {
                console.debug("Moooop!!!", value);
                $scope.map = MapService.zoomTo(value);
            });

            AnnyangService.addCommand(commands['map_zoom_reset']['voice'], function() {
                console.debug("Zoooommmmmzzz00000!!!");
                $scope.map = MapService.reset();
                $scope.focus = "map";
            });

            // Search images
            AnnyangService.addCommand(commands['images_search']['voice'], function(term) {
                console.debug("Showing", term);
                SayService.speak("Ok, showing");
            });

            // Change name
            AnnyangService.addCommand(commands['account_set_name']['voice'], function(name) {
                console.debug("Hi", name, "nice to meet you");
                $scope.user.name = name;
            });

            // Set a reminder
            AnnyangService.addCommand(commands['reminder_insert']['voice'], function(task) {
                console.debug("I'll remind you to", task);
                SayService.speak("Ok, I'll remind you to", task);
            });

            // Clear reminders
            AnnyangService.addCommand(commands['reminder_clear']['voice'], function() {
                console.debug("Clearing reminders");
                SayService.speak("Ok, Clearing reminders");
            });

            // Check the time
            AnnyangService.addCommand(commands['time_show']['voice'], function(task) {
                 console.debug("It is", moment().format('h:mm:ss a'));
                 SayService.speak("Ok, It is", moment().format('h:mm:ss a'));
            });

            // Turn lights off
            AnnyangService.addCommand(commands['light_action']['voice'], function(state, action) {
                HueService.performUpdate(state + " " + action);
            });

            //Show giphy image
            AnnyangService.addCommand(commands['image_giphy']['voice'], function(img) {
                GiphyService.init(img).then(function(){
                    $scope.gifimg = GiphyService.giphyImg();
                    $scope.focus = "gif";
                });
            });

            // Show xkcd comic
            AnnyangService.addCommand(commands['image_comic']['voice'], function(state, action) {
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
                //console.log(interimResult);
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
        $scope.layoutName = (typeof config.layout != 'undefined' && config.layout)?config.layout:'main';
    }

    angular.module('SmartMirror')
        .controller('Theme', themeController);

}(window.angular));
