(function(annyang) {
    'use strict';

    function SpeechService($rootScope) {
        var service = {};
        
        // KEYWORD SPOTTER
        // some other samples: [["SMART", "S M AA R T"], ["MIRROR", "M IH R ER"], ["OKAY", "OW K EY"], ["GOOGLE", "G UW G AH L"], ["START", "S T AA R T"], ["STOP", "S T AA P"], ["HELLO",  "HH AH L OW"], ["HELLO(1)", "HH EH L OW"], ["GOODBYE", "G UH D B AY"]];
        // other keywords = [{title: "Smart Mirror", g: "SMART MIRROR"}, {title: "OK Google", g: "OKAY GOOGLE"}, {title: "Start", g: "START"}, {title: "Stop", g: "STOP"}, {title: "Hello", g: "HELLO"}, {title: "Goodbye", g: "GOODBYE"}
        var wordList = [["SMART", "S M AA R T"], ["MIRROR", "M IH R ER"]];
        var keyword = {title: "Smart Mirror", g: "SMART MIRROR"};
        var keywordId;
      
        var recognizer, recorder, callbackManager, audio_context, isRecognizerReady;
        var isRecorderReady = isRecognizerReady = false;
        
        // Send a request to the recognizer worker
        function postRecognizerJob(message, callback) {
            var msg = message || {};
            if(callbackManager) {
                msg.callbackId = callbackManager.add(callback);
            }
            if (recognizer) {
                recognizer.postMessage(msg);
            }
        };

        // create a new worker from the given url
        function spawnWorker(workerurl, onReady) {
            recognizer = new Worker(workerurl);
            recognizer.onmessage = function(event) {
                onReady(recognizer);
            };
            recognizer.postMessage('');
        };
        
        // When the Keyword Spotter is ready
        function updateState() {
            if (isRecorderReady && isRecognizerReady) {
                // TODO callback here for when recognizer is ready
            }
        };

        // Log the state of the Keyword Spotter
        function updateStatus(newStatus) {
            console.log("Keyword Sppotter: ", newStatus);
        };

        // Get a media steam from the users mic for processing
        function startUserMedia(stream) {
            var input = audio_context.createMediaStreamSource(stream);
            window.firefox_audio_hack = input;
            var audioRecorderConfig = {errorCallback: function(x) {updateStatus("Error from recorder: " + x);}};
            recorder = new AudioRecorder(input, audioRecorderConfig);
            // If a recognizer is ready, we pass it to the recorder
            if (recognizer) recorder.consumers = [recognizer];
            isRecorderReady = true;
            updateState();
            updateStatus("Audio recorder ready");
        };

        // start the Keyword Spotter (must be "ready")
        var keywordSpotterStart = function() {
            if (recorder && recorder.start(keywordId)) {
                // TODO callback for spotting
                updateStatus("Listening");
            }
        };

        // stop the Keyword Spotter
        var keywordSpotterStop = function() {
            recorder && recorder.stop();
            // todo callback for stop spotting
        };

        // When the recognizer is ready
        var recognizerReady = function() {
            isRecognizerReady = true;
            updateState();
            updateStatus("Recognizer ready");
            keywordSpotterStart();
        };

        // Feed words to recognize into the worker
        var feedWords = function(words) {
            postRecognizerJob({
                command: 'addWords', 
                data: words
            },
            function() {
                feedKeyword();
            });
        };
        
        // Feed the keyword to listen for into the worker
        var feedKeyword = function() {
            postRecognizerJob({
                command: 'addKeyword', 
                data: keyword.g
            }, function(id) {
                keywordId = id;
                recognizerReady();
            });
        };

        // Prepare the recgnizer
        var initRecognizer = function() {
            postRecognizerJob({
                command: 'initialize', 
                data: [["-kws_threshold", "2"]]
            },
            function() {
                if (recorder) recorder.consumers = [recognizer];
                feedWords(wordList);
            });
        };
        
        service.init = function() {
            // Set the lenguage for Speech to text (Only applis to Annyang)
            annyang.setLanguage(config.language);
            
            updateStatus("Initializing Web Audio and keyword spotter");
            callbackManager = new CallbackManager();
            var oldCount = 0;
            spawnWorker("js/services/speech/recognizer.js", function(worker) {
                worker.onmessage = function(e) {
                    if (e.data.hasOwnProperty('id')) {
                        var clb = callbackManager.get(e.data['id']);
                        var data = {};
                        if( e.data.hasOwnProperty('data')) {
                            data = e.data.data;
                        }
                        if(clb){
                            clb(data);
                        }
                    }
                    if (e.data.hasOwnProperty('count')) {
                        var newCount = e.data.count;
                        if(oldCount != newCount){
                            oldCount = newCount; 
                            // Annyang listen for a command
                            service.start();
                        }
                    }
                    if (e.data.hasOwnProperty('status') && (e.data.status == "error")) {
                        updateStatus("Error in " + e.data.command + " with code " + e.data.code);
                    }
                };
                initRecognizer();
            });
            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                //window.URL = window.URL || window.webkitURL;
                audio_context = new AudioContext();
            } catch (e) {
                updateStatus("Error initializing Web Audio browser");
            }
            if (navigator.getUserMedia){
                navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
                    updateStatus("No live audio input in this browser");
                })
            } else {
                updateStatus("No web audio support in this browser");
            }
        };

        // Register callbacks for the controller. does not utelize CallbackManager()
        service.registerCallbacks = function(cb) {
            // annyang.addCommands(service.commands);
            
            // Annyang is a bit "chatty", turn this on only for debugging
            annyang.debug(false);
            
            // add specified callback functions
            if (isCallback(cb.listening)) {
                annyang.addCallback('start', function(){
                    $rootScope.$apply(cb.listening(true));
                });
                annyang.addCallback('end', function(data){
                    $rootScope.$apply(cb.listening(false));
                });
            };
            if (isCallback(cb.interimResult)) {
                annyang.addCallback('interimResult', function(data){
                    $rootScope.$apply(cb.interimResult(data));
                });
            };
            if (isCallback(cb.result)) {
                annyang.addCallback('result', function(data){
                    $rootScope.$apply(cb.result(data));
                });
            };
            if (isCallback(cb.error)) {
                annyang.addCallback('error', function(data){
                    $rootScope.$apply(cb.error(data));
                });
            };
            if (isCallback(cb.spottingState)) {
                // TODO create a callback that tracks the readyness/state of keyword spotting
                // so it can reflect in the UI
                // maybe I should use $watch() here?
                
                // if the keyword spotter is already ready (unlikeley)
                if(isRecorderReady && isRecognizerReady){
                    $rootScope.$apply(cb.spottingState('spotting'))
                } else {
                    
                }
            };
        };
        
        // Ensure callback is a valid function
        function isCallback(callback){
            return typeof(callback) == "function";
        }
        
        // COMMANDS
        service.commands = {};
        service.addCommand = function(phrase, callback) {
            var command = {};

            // Wrap annyang command in scope apply
            command[phrase] = function(arg1, arg2) {
                $rootScope.$apply(callback(arg1, arg2));
            };

            // Extend our commands list
            angular.extend(service.commands, command);

            // Add the commands to annyang
            annyang.addCommands(service.commands);
            console.debug('added command "' + phrase + '"', service.commands);
        };
        
        // Annyang start listening
        service.start = function(){
            // Listen for the next utterance and then stop
            annyang.start({autoRestart: false, continuous: false});
        }
        
        // Annyang stop listening
        service.abort = function(){
            annyang.abort();
        }
        
        service.init();

        return service;
    }

    angular.module('SmartMirror')
        .factory('SpeechService', SpeechService);

}(window.annyang));
