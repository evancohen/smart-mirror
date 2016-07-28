(function(angular) {
    'use strict';

    function MirrorCtrl(
            SpeechService,
            AutoSleepService,
            GeolocationService,
            WeatherService,
            FitbitService,
            MapService,
            LightService,
            CalendarService,
            ComicService,
            GiphyService,
            TrafficService,
            TimerService,
            ReminderService,
            SearchService,
            SoundCloudService,
            RssService,
            StockService,
            ScrobblerService,
            $rootScope, $scope, $timeout, $interval, tmhDynamicLocale, $translate) {

        // Local Scope Vars
        var _this = this;
        $scope.listening = false;
        $scope.debug = false;
        $scope.focus = "default";
        $scope.user = {};
        $scope.shownews = true;
        $scope.commands = [];
        $scope.interimResult = $translate.instant('home.commands');
        $scope.layoutName = 'main';
        $scope.fitbitEnabled = false;
        $scope.config = config;

        if (typeof config.fitbit !== 'undefined') {
            $scope.fitbitEnabled = true;
        }

        //set lang
        moment.locale(
          (typeof config.language !== 'undefined')?config.language.substring(0, 2).toLowerCase(): 'en',
          {
            calendar : {
              lastWeek : '[Last] dddd',
              lastDay : '[Yesterday]',
              sameDay : '[Today]',
              nextDay : '[Tomorrow]',
              nextWeek : 'dddd',
              sameElse : 'L'
            }
          }
        );

        console.log('moment local', moment.locale());

        //Update the time
        function updateTime(){
            $scope.date = new moment();

            // Auto wake at a specific time
            if (typeof config.autoTimer !== 'undefined' && typeof config.autoTimer.auto_wake !== 'undefined' && config.autoTimer.auto_wake == moment().format('HH:mm:ss')) {
                console.debug('Auto-wake', config.autoTimer.auto_wake);
                $scope.focus = "default";
                AutoSleepService.wake();
                AutoSleepService.startAutoSleepTimer();
            }
        }

        // Reset the command text
        var restCommand = function(){
            $translate('home.commands').then(function (translation) {
                $scope.interimResult = translation;
            });
        };

        /**
         * Register a refresh callback for a given interval (in minutes)
         */
        var registerRefreshInterval = function(callback, interval){
            //Load the data initially
            callback();
            if(typeof interval !== 'undefined'){
                $interval(callback, interval * 60000);
            }
        }

        _this.init = function() {
            AutoSleepService.startAutoSleepTimer();

            var tick = $interval(updateTime, 1000);
            updateTime();
            GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                console.log("Geoposition", geoposition);
                $scope.map = MapService.generateMap(geoposition.coords.latitude+','+geoposition.coords.longitude);
            });
            restCommand();

            //Initialize SoundCloud
            var playing = false, sound;
            SoundCloudService.init();

            var refreshCalendar = function() {
                CalendarService.getCalendarEvents().then(function(response) {
                    $scope.calendar = CalendarService.getFutureEvents();
                }, function(error) {
                    console.log(error);
                });
            };

            registerRefreshInterval(refreshCalendar, 25);

            var refreshFitbitData = function() {
                console.log('refreshing fitbit data');
                FitbitService.profileSummary(function(response){
                    $scope.fbDailyAverage = response;
                });

                FitbitService.todaySummary(function(response){
                    $scope.fbToday = response;
                });

                FitbitService.sleepSummary(function(response){
                    $scope.fbSleep = response;
                });

                FitbitService.deviceSummary(function(response){
                    $scope.fbDevices = response;
                });
            };

            if($scope.fitbitEnabled){
                registerRefreshInterval(refreshFitbitData, 60);
            }

            var refreshWeatherData = function() {
                //Get our location and then get the weather for our location
                GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                    console.log("Geoposition", geoposition);
                    WeatherService.init(geoposition).then(function(){
                        $scope.currentForecast = WeatherService.currentForecast();
                        $scope.weeklyForecast = WeatherService.weeklyForecast();
                        $scope.hourlyForecast = WeatherService.hourlyForecast();
                        $scope.minutelyForecast = WeatherService.minutelyForecast();
                        console.log("Current", $scope.currentForecast);
                        console.log("Weekly", $scope.weeklyForecast);
                        console.log("Hourly", $scope.hourlyForecast);
                        console.log("Minutely", $scope.minutelyForecast);

                        var skycons = new Skycons({"color": "#aaa"});
                        skycons.add("icon_weather_current", $scope.currentForecast.iconAnimation);

                        skycons.play();

                        $scope.iconLoad = function (elementId, iconAnimation){
                            skycons.add(document.getElementById(elementId), iconAnimation);
                            skycons.play();
                        };

                    });
                }, function(error){
                    console.log(error);
                });
            };

            if(typeof config.forecast !== 'undefined'){
                registerRefreshInterval(refreshWeatherData, config.forecast.refreshInterval || 2);
            }

            var greetingUpdater = function () {
                if(typeof config.greeting !== 'undefined' && !Array.isArray(config.greeting) && typeof config.greeting.midday !== 'undefined') {
                    var hour = moment().hour();
                    var greetingTime = "midday";

                    if (hour > 4 && hour < 11) {
                        greetingTime = "morning";
                    } else if (hour > 18 && hour < 23) {
                        greetingTime = "evening";
                    } else if (hour >= 23 || hour < 4) {
                        greetingTime = "night";
                    }
                    var nextIndex = Math.floor(Math.random() * config.greeting[greetingTime].length);
                    var nextGreeting = config.greeting[greetingTime][nextIndex]
                    $scope.greeting = nextGreeting;
                }else if(Array.isArray(config.greeting)){
                    $scope.greeting = config.greeting[Math.floor(Math.random() * config.greeting.length)];
                }
            };

            if(typeof config.greeting !== 'undefined'){
                registerRefreshInterval(greetingUpdater, 60);
            }

            var refreshTrafficData = function() {
                TrafficService.getDurationForTrips().then(function(tripsWithTraffic) {
                    console.log("Traffic", tripsWithTraffic);
                    //Todo this needs to be an array of traffic objects -> $trips[]
                    $scope.trips = tripsWithTraffic;
                }, function(error){
                    $scope.traffic = {error: error};
                });
            };

            if(typeof config.traffic !== 'undefined'){
                registerRefreshInterval(refreshTrafficData, config.traffic.refreshInterval || 5);
            }

            var refreshComic = function () {
                console.log("Refreshing comic");
                ComicService.initDilbert().then(function(data) {
                    console.log("Dilbert comic initialized");
                }, function(error) {
                    console.log(error);
                });
            };

            registerRefreshInterval(refreshComic, 12*60); // 12 hours

            var defaultView = function() {
                console.debug("Ok, going to default view...");
                $scope.focus = "default";
            }

            var refreshRss = function () {
                console.log ("Refreshing RSS");
                $scope.news = null;
                RssService.refreshRssList().then(function() {
                  $scope.news = RssService.getNews();
                });

            };

            var updateNews = function() {
                $scope.news = RssService.getNews();
            };

            var getStock = function() {
              StockService.getStockQuotes().then(function(result) {
                var stock = [];
                if (result.query.results.quote instanceof Array) {
                  stock = stock.concat(result.query.results.quote);
                } else {
                  stock.push(result.query.results.quote);
                }
                $scope.stock = stock;
              }, function(error) {
                console.log(error);
              });
            }    

            if (typeof config.stock !== 'undefined' && config.stock.names.length) {
              registerRefreshInterval(getStock, 30);
            }

            if(typeof config.rss !== 'undefined'){
                registerRefreshInterval(refreshRss, config.rss.refreshInterval || 30);
                registerRefreshInterval(updateNews, 2);
            }

            var getScrobblingTrack = function(){
                ScrobblerService.getCurrentTrack().then(function(track) {
                    $scope.track = track;
                });
            }

            if(typeof config.lastfm !== 'undefined' && typeof config.lastfm.key !== 'undefined' && config.lastfm.user !== 'undefined'){
                registerRefreshInterval(getScrobblingTrack, config.lastfm.refreshInterval || 0.6)
            }

            var refreshRss = function () {
                console.log ("Refreshing RSS");
                $scope.news = null;
                RssService.refreshRssList();
            };

            var updateNews = function() {
                $scope.shownews = false;
                setTimeout(function(){ $scope.news = RssService.getNews(); $scope.shownews = true; }, 1000);
            };

            refreshRss();
            $interval(refreshRss, config.rss.refreshInterval * 60000);
            
            updateNews();
            $interval(updateNews, 8000);  // cycle through news every 8 seconds

            var addCommand = function(commandId, commandFunction){
                var voiceId = 'commands.'+commandId+'.voice';
                var textId = 'commands.'+commandId+'.text';
                var descId = 'commands.'+commandId+'.description';
                $translate([voiceId, textId, descId]).then(function (translations) {
                    SpeechService.addCommand(translations[voiceId], commandFunction);
                    if (translations[textId] !== '') {
                        var command = {"text": translations[textId], "description": translations[descId]};
                        $scope.commands.push(command);
                    }
                });
            };

            // List commands
            addCommand('list', function() {
                console.debug("Here is a list of commands...");
                console.log(SpeechService.commands);
                $scope.focus = "commands";
            });


            // Go back to default view
            addCommand('home', defaultView);

            // Hide everything and "sleep"
            addCommand('sleep', function() {
                console.debug("Ok, going to sleep...");
                $scope.focus = "sleep";
            });

            // Go back to default view
            addCommand('wake_up', defaultView);

            // Turn off HDMI output
            addCommand('screen off', function() {
                console.debug('turning screen off');
                AutoSleepService.sleep();
            });

            // Turn on HDMI output
            addCommand('screen on', function() {
                console.debug('turning screen on');
                AutoSleepService.wake();
                $scope.focus = "default"
            });

            // Hide everything and "sleep"
            addCommand('debug', function() {
                console.debug("Boop Boop. Showing debug info...");
                $scope.debug = true;
            });

            // Show map
            addCommand('map_show', function() {
                console.debug("Going on an adventure?");
                GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                    console.log("Geoposition", geoposition);
                    $scope.map = MapService.generateMap(geoposition.coords.latitude+','+geoposition.coords.longitude);
                    $scope.focus = "map";
                });
            });

            // Hide everything and "sleep"
            addCommand('map_location', function(location) {
                console.debug("Getting map of", location);
                $scope.map = MapService.generateMap(location);
                $scope.focus = "map";
            });

            // Zoom in map
            addCommand('map_zoom_in', function() {
                console.debug("Zoooooooom!!!");
                $scope.map = MapService.zoomIn();
            });

            addCommand('map_zoom_out', function() {
                console.debug("Moooooooooz!!!");
                $scope.map = MapService.zoomOut();
            });

            addCommand('map_zoom_point', function(value) {
                console.debug("Moooop!!!", value);
                $scope.map = MapService.zoomTo(value);
            });

            addCommand('map_zoom_reset', function() {
                console.debug("Zoooommmmmzzz00000!!!");
                $scope.map = MapService.reset();
                $scope.focus = "map";
            });

            //SoundCloud search and play
            addCommand('sc_play', function(query) {
                SoundCloudService.searchSoundCloud(query).then(function(response){
                    if (response[0].artwork_url){
                        $scope.scThumb = response[0].artwork_url.replace("-large.", "-t500x500.");
                    } else {
                        $scope.scThumb = 'http://i.imgur.com/8Jqd33w.jpg?1';
                    }
                    $scope.scWaveform = response[0].waveform_url;
                    $scope.scTrack = response[0].title;
                    $scope.focus = "sc";
                    SoundCloudService.play();
                });
            });

            //SoundCloud stop
            addCommand('sc_pause', function() {
                SoundCloudService.pause();
                $scope.focus = "default";
            });
            //SoundCloud resume
            addCommand('sc_resume', function() {
                SoundCloudService.play();
                $scope.focus = "sc";
            });
            //SoundCloud replay
            addCommand('sc_replay', function() {
                SoundCloudService.replay();
                $scope.focus = "sc";
            });

            //Search for a video
            addCommand('video_search', function(query){
                SearchService.searchYouTube(query).then(function(results){
                    //Set cc_load_policy=1 to force captions
                    $scope.video = 'http://www.youtube.com/embed/'+results.data.items[0].id.videoId+'?autoplay=1&controls=0&iv_load_policy=3&enablejsapi=1&showinfo=0';
                    $scope.focus = "video";
                });
            });
            //Stop video
            addCommand('video_stop', function() {
              var iframe = document.getElementsByTagName("iframe")[0].contentWindow;
              iframe.postMessage('{"event":"command","func":"' + 'stopVideo' +   '","args":""}', '*');
              $scope.focus = "default";
            });

            // Set a reminder
            addCommand('reminder_insert', function(task) {
                console.debug("I'll remind you to", task);
                $scope.reminders = ReminderService.insertReminder(task);
                $scope.focus = "reminders";
            });

            // Clear reminders
            addCommand('reminder_clear', function() {
                console.debug("Clearing reminders");
                $scope.reminders = ReminderService.clearReminder();
                $scope.focus = "default";
            });

            // Clear reminders
            addCommand('reminder_show', function() {
                console.debug("Showing reminders");
                $scope.reminders = ReminderService.getReminders();
                $scope.focus = "reminders";
            });

            // Check the time
            addCommand('time_show', function(task) {
                 console.debug("It is", moment().format('h:mm:ss a'));
            });

            // Control light
            addCommand('light_action', function(state, action) {
                LightService.performUpdate(state + " " + action);
            });

            //Show giphy image
            addCommand('image_giphy', function(img) {
                GiphyService.init(img).then(function(){
                    $scope.gifimg = GiphyService.giphyImg();
                    $scope.focus = "gif";
                });
            });

            //Show fitbit stats (registered only if fitbit is configured in the main config)
            if ($scope.fitbitEnabled) {
                addCommand('show_my_walking', function() {
                    refreshFitbitData();
                });
            }

            // Show xkcd comic
            addCommand('image_comic', function(state, action) {
                console.debug("Fetching a comic for you.");
                ComicService.getXKCD().then(function(data){
                    $scope.xkcd = data.img;
                    $scope.focus = "xkcd";
                });
            });

            // Show Dilbert comic
            addCommand('image_comic_dilbert', function(state, action) {
                console.debug("Fetching a Dilbert comic for you.");
                $scope.dilbert = ComicService.getDilbert("today");  // call it with "random" for random comic
                $scope.focus = "dilbert";
            });

            // Start timer
            addCommand('timer_start', function(duration) {
                console.debug("Starting timer");
                TimerService.start(duration);
                $scope.timer = TimerService;
                $scope.focus = "timer";

                $scope.$watch('timer.countdown', function(countdown){
                    if (countdown === 0) {
                        TimerService.stop();
                        // defaultView();
                    }
                });
            });

            // Show timer
            addCommand('timer_show', function() {
              if (TimerService.running) {
                // Update animation
                if (TimerService.paused) {
                  TimerService.start();
                  TimerService.stop();
                } else {
                  TimerService.start();
                }

                $scope.focus = "timer";
              }
            });

            // Stop timer
            addCommand('timer_stop', function() {
              if (TimerService.running && !TimerService.paused) {
                TimerService.stop();
              }
            });

            // Resume timer
            addCommand('timer_resume', function() {
              if (TimerService.running && TimerService.paused) {
                TimerService.start();
                $scope.focus = "timer";
              }
            });

            var resetCommandTimeout;
            //Register callbacks for Annyang and the Keyword Spotter
            SpeechService.registerCallbacks({
                listening : function(listening){
                    $scope.listening = listening;
                },
                interimResult : function(interimResult){
                    $scope.interimResult = interimResult;
                    $timeout.cancel(resetCommandTimeout);
                },
                result : function(result){
                    if(typeof result !== 'undefined'){
                        $scope.interimResult = result[0];
                        resetCommandTimeout = $timeout(restCommand, 5000);
                    }
                },
                error : function(error){
                    console.log(error);
                    if(error.error == "network"){
                        $scope.speechError = "Google Speech Recognizer: Network Error (Speech quota exceeded?)";
                        SpeechService.abort();
                    } else {
                        // Even if it isn't a network error, stop making requests
                        SpeechService.abort();
                    }
                }
            });
        };

        _this.init();
    }

    angular.module('SmartMirror')
        .controller('MirrorCtrl', MirrorCtrl);

    function themeController($scope) {
        $scope.layoutName = (typeof config.layout !== 'undefined' && config.layout)?config.layout:'main';
    }

    angular.module('SmartMirror')
        .controller('Theme', themeController);

}(window.angular));
