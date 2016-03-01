(function(angular) {
    'use strict';

    function MirrorCtrl(
            AnnyangService,
            GeolocationService,
            WeatherService,
            MapService,
            HueService,
            CalendarService,
            XKCDService,
            GiphyService,
            TrafficService,
            $scope, $timeout, $interval, tmhDynamicLocale) {
        var _this = this;
        var DEFAULT_COMMAND_TEXT = 'Say "What can I say?" to see a list of commands...';
        $scope.listening = false;
        $scope.debug = false;
        $scope.focus = "default";
        $scope.user = {};
        $scope.interimResult = DEFAULT_COMMAND_TEXT;

        $scope.layoutName = 'main';

        //set lang
        tmhDynamicLocale.set(config.language);
        moment.locale(config.language);


        $scope.dateFormat = config.dateFormat;
        $scope.calcDateFormat = config.calendar.dateFormat;
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


                }, function(error){
                    console.log(error);
                });

                CalendarService.getCalendarEvents().then(function(response) {
                    $scope.calendar = CalendarService.getFutureEvents();
                }, function(error) {
                    console.log(error);
                });

                if(typeof config.greeting.midday == 'undefined') {
                    $scope.greeting = config.greeting[Math.floor(Math.random() * config.greeting.length)];
                }

            };

            refreshMirrorData();
            $interval(refreshMirrorData, 1500000);

            if(typeof config.greeting.midday != 'undefined') {
                var greetingUpdater = function () {
                    if (moment().hour() > 4 && moment().hour() < 11) {
                        $scope.greeting = config.greeting.morning[Math.floor(Math.random() * config.greeting.morning.length)];
                    } else if (moment().hour() > 18 && moment().hour() < 23) {
                        $scope.greeting = config.greeting.evening[Math.floor(Math.random() * config.greeting.evening.length)];
                    } else if (moment().hour() >= 23 || moment().hour() < 4) {
                        $scope.greeting = config.greeting.night[Math.floor(Math.random() * config.greeting.night.length)];
                    } else {
                        $scope.greeting = config.greeting.midday[Math.floor(Math.random() * config.greeting.midday.length)];
                    }
                };
                greetingUpdater();
                $interval(greetingUpdater, 120000);
            }

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

            var defaultView = function() {
                console.debug("Ok, going to default view...");
                $scope.focus = "default";
            }

            //sleep timer
            //var sleepTimer = function (){
            //    if(typeof config.sleep_timer != 'undefined'
            //    && typeof config.sleep_timer.start != 'undefined'
            //    && typeof config.sleep_timer.end != 'undefined'){
            //        console.log(moment().hour() <= config.sleep_timer.start);
            //        console.log('END: ')
            //        console.log(moment().hour() > config.sleep_timer.end);
            //        if(moment().hour() <= config.sleep_timer.start || moment().hour() > config.sleep_timer.end){
            //            $scope.focus = "sleep";
            //        }
            //    }
            //};
            //$interval(sleepTimer, 6000);


            //AnnyangService.setLanguage('de-DE');

            // List commands
            AnnyangService.addCommand('What can I say', function() {
                console.debug("Here is a list of commands...");
                console.log(AnnyangService.commands);
                $scope.focus = "commands";
            });

            // Go back to default view
            AnnyangService.addCommand('Go home', defaultView);

            // Hide everything and "sleep"
            AnnyangService.addCommand('good night', function() {
                console.debug("Ok, going to sleep...");
                $scope.focus = "sleep";
            });

            // Go back to default view
            AnnyangService.addCommand('wake up', function(){
                defaultView();
                //$interval.cancel(sleepTimer);
                //$interval(sleepTimer, 120000);
                //sleepTimer = undefined;
            });

            // Hide everything and "sleep"
            AnnyangService.addCommand('Show debug information', function() {
                console.debug("Boop Boop. Showing debug info...");
                $scope.debug = true;
            });

            // Hide everything and "sleep"
            AnnyangService.addCommand('Show map', function() {
                console.debug("Going on an adventure?");
                GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                    console.log("Geoposition", geoposition);
                    $scope.map = MapService.generateMap(geoposition.coords.latitude+','+geoposition.coords.longitude);
                    $scope.focus = "map";
                });
             });

            // Hide everything and "sleep"
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
            AnnyangService.addCommand('Remind me to *task', function(task) {
                console.debug("I'll remind you to", task);
            });

            // Clear reminders
            AnnyangService.addCommand('Clear reminders', function() {
                console.debug("Clearing reminders");
            });

            // Check the time
            AnnyangService.addCommand('what time is it', function(task) {
                 console.debug("It is", moment().locale('de').format('h:mm:ss a'));
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
                XKCDService.getXKCD().then(function(data){
                    $scope.xkcd = data.img;
                    $scope.focus = "xkcd";
                });
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
