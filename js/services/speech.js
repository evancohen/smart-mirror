(function(annyang) {
    'use strict';

    function SpeechService($rootScope) {
        var service = {};
        
        // KEYWORD SPOTTER
        var wordList = [["SMART", "S M AA R T"], ["MIRROR", "M IH R ER"], ["OKAY", "OW K EY"], ["GOOGLE", "G UW G AH L"], ["START", "S T AA R T"], ["STOP", "S T AA P"], ["HELLO",  "HH AH L OW"], ["HELLO(1)", "HH EH L OW"], ["GOODBYE", "G UH D B AY"]];
        var keywords = [{title: "Smart Mirror", g: "SMART MIRROR"}, {title: "OK Google", g: "OKAY GOOGLE"}, {title: "Start", g: "START"}, {title: "Stop", g: "STOP"}, {title: "Hello", g: "HELLO"}, {title: "Goodbye", g: "GOODBYE"}];
        var keywordIds = [];
      
        var recognizer, recorder, callbackManager, audio_context, isRecognizerReady;
        var isRecorderReady = isRecognizerReady = false;
        
        function postRecognizerJob(message, callback) {
            var msg = message || {};
            if(callbackManager) {
                msg.callbackId = callbackManager.add(callback);
            }
            if (recognizer) {
                recognizer.postMessage(msg);
            }
        };

        function spawnWorker(workerurl, onReady) {
            recognizer = new Worker(workerurl);
            recognizer.onmessage = function(event) {
                onReady(recognizer);
            };
            recognizer.postMessage('');
        };

        function updateCount(count) {
            document.getElementById('output').innerHTML = count;
        };
        
        function updateUI() {
            if (isRecorderReady && isRecognizerReady) startBtn.disabled = stopBtn.disabled = false;
        };

        function updateStatus(newStatus) {
            document.getElementById('current-status').innerHTML += "<br/>" + newStatus;
        };

        function displayRecording(display) {
        if (display) document.getElementById('recording-indicator').innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        else document.getElementById('recording-indicator').innerHTML = "";
        };

        function startUserMedia(stream) {
        var input = audio_context.createMediaStreamSource(stream);
        window.firefox_audio_hack = input;
        var audioRecorderConfig = {errorCallback: function(x) {updateStatus("Error from recorder: " + x);}};
        recorder = new AudioRecorder(input, audioRecorderConfig);
        // If a recognizer is ready, we pass it to the recorder
        if (recognizer) recorder.consumers = [recognizer];
        isRecorderReady = true;
        updateUI();
        updateStatus("Audio recorder ready");
        };

        var keywordSpotterStart = function() {
        var id = document.getElementById('keywords').value;
        if (recorder && recorder.start(id)) displayRecording(true);
        };

        var keywordSpotterStop = function() {
        recorder && recorder.stop();
        displayRecording(false);
        };

        var recognizerReady = function() {
            updateKeywords();
            isRecognizerReady = true;
            updateUI();
            updateStatus("Recognizer ready");
        };

        var updateKeywords = function() {
            var selectTag = document.getElementById('keywords');
            for (var i = 0 ; i < keywordIds.length ; i++) {
                var newElt = document.createElement('option');
                newElt.value=keywordIds[i].id;
                newElt.innerHTML = keywordIds[i].title;
                selectTag.appendChild(newElt);
            }                          
        };


        var feedKeyword = function(g, index, id) {
            if (id && (keywordIds.length > 0)){
                keywordIds[0].id = id.id;
            }
            if (index < g.length) {
                keywordIds.unshift({title: g[index].title})
                postRecognizerJob({
                    command: 'addKeyword', 
                    data: g[index].g
                }, function(id) {
                    feedKeyword(keywords, index + 1, {id:id});
                });
            } else {
                recognizerReady();
            }
        };

        var feedWords = function(words) {
            postRecognizerJob({
                command: 'addWords', 
                data: words
            },
            function() {
                feedKeyword(keywords, 0);
            });
        };

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

        service.init = function() {
            // Set the lenguage for Speech to text
            annyang.setLanguage(config.language);
            
            updateStatus("Initializing Web Audio and keyword spotter");
            callbackManager = new CallbackManager();
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
                        if (e.data.hasOwnProperty('final') &&  e.data.final) {
                            newCount = "Final: " + newCount;
                        }
                        updateCount(newCount);
                        // pause Keyword spotter and start Annyang
                        keywordSpotterStop();
                        service.start();
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
                window.URL = window.URL || window.webkitURL;
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

            var startBtn = document.getElementById('startBtn');
            var stopBtn = document.getElementById('stopBtn');
            startBtn.disabled = true;
            stopBtn.disabled = true;
            startBtn.onclick = keywordSpotterStart;
            stopBtn.onclick = keywordSpotterStop;
        };

        service.registerCallbacks = function(listening, interimResult, result, error) {
            annyang.addCommands(service.commands);
            annyang.debug(true);
            // add specified callback functions
            if (typeof(listening) == "function") {
                annyang.addCallback('start', function(){$rootScope.$apply(listening(true));});
                annyang.addCallback('end', function(data){
                    console.log("End", data);
                    keywordSpotterStart();
                });
            };
            if (typeof(interimResult) == "function") {
                annyang.addCallback('interimResult', function(data){
                    $rootScope.$apply(interimResult(data));
                });
            };
            if (typeof(result) == "function") {
                annyang.addCallback('result', function(data){
                    $rootScope.$apply(result(data));
                });
            };
            if (typeof(error) == "function") {
                annyang.addCallback('error', function(data){
                    $rootScope.$apply(error(data));
                });
            };
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
