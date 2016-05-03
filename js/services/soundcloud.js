(function() {
    'use strict';

    function SoundCloudService($http) {
        var service = {};
        var audioCtx = null,
            _stream = null,
            intv = null;
		service.scResponse = null;

		service.init = function() {
			SC.initialize({
				client_id: config.soundcloud.key
			});
		}

        //Returns the soundcloud search results for the given query
        service.searchSoundCloud = function(query) {
            return $http.get('https://api.soundcloud.com/tracks.json?client_id=' + config.soundcloud.key + '&q=' + query + '&limit=1').
                then(function(response) {
                    service.scResponse = response.data;
					console.debug("SoundCloud link: ", service.scResponse[0].permalink_url);
					return service.scResponse;
                });
        };

        service.startVisualizer = function(){
            navigator.getUserMedia  = navigator.getUserMedia ||
                                    navigator.webkitGetUserMedia ||
                                    navigator.mozGetUserMedia ||
                                    navigator.msGetUserMedia;

            var audio = document.querySelector('audio');

            var errorCallback = function(e) {
              console.log('Reeeejected!', e);
            };

            if (navigator.getUserMedia) {
              navigator.getUserMedia({audio: true}, function(stream) {
                _stream = stream;
                audioCtx = new (window.AudioContext)()
                var source = audioCtx.createMediaStreamSource(_stream);
                var filter = audioCtx.createBiquadFilter();

                var analyser = audioCtx.createAnalyser();
                source.connect(analyser);
                filter.connect(audioCtx.destination);

                var bufferLength = analyser.frequencyBinCount;
                console.log(bufferLength);

                var dataArray = new Uint8Array(bufferLength);

                function draw() {
                  analyser.getByteTimeDomainData(dataArray);
                  drawCanvas(dataArray,bufferLength);
                };

                intv = setInterval(function(){ draw() }, 1000 / 30);

              }, errorCallback);
            }
        };

        service.stopVisualizer = function(){
            clearInterval(intv);
            audioCtx.close();
            _stream.getAudioTracks()[0].stop();
        }
        return service;
    }

    function drawCanvas(dataArray,bufferLength){
      var canvas = document.getElementById('visualizer');
      var canvasCtx = canvas.getContext("2d");

      var WIDTH = 150;
      var HEIGHT = 150;

      canvasCtx.fillStyle = 'rgb(0, 0, 0)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
      canvasCtx.strokeStyle = 'rgb(255,255,255)';

      canvasCtx.lineWidth = 2;
      canvasCtx.beginPath();

      var sliceWidth = WIDTH * 1.0 / bufferLength;
      var x = 0;

      for(var i = 0; i < bufferLength; i++) {
        var data = dataArray[i];
        var v = data / 128.0;
        var y = v * HEIGHT/2;

        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }
      canvasCtx.lineTo(canvas.width, canvas.height/2);
      canvasCtx.stroke();
    }

    angular.module('SmartMirror')
        .factory('SoundCloudService', SoundCloudService);

}());
