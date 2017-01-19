/* global SC:true */
(function () {
	'use strict';

	function SoundCloudService($http) {
		var service = {};
		var intv,
			audio = document.querySelector('audio'),
			audiosource = new SoundCloudAudioSource(audio);

		service.scResponse = null;

		service.init = function () {
      // If the soundcloud key is defined and not empty
			if (typeof config.soundcloud != 'undefined' && config.soundcloud.length) {
				SC.initialize({
					client_id: config.soundcloud.key
				});
			}
		}

    //Returns the soundcloud search results for the given query
		service.searchSoundCloud = function (query) {
			return $http.get('https://api.soundcloud.com/tracks.json?client_id=' + config.soundcloud.key + '&q=' + query + '&limit=2').
        then(function (response) {
	service.scResponse = response.data;
	var streamUrl = service.scResponse[0].stream_url + '?client_id=' + config.soundcloud.key;
	audio.setAttribute('src', streamUrl);
	return service.scResponse;
});
		};

		service.play = function () {
			audio.play();
			intv = setInterval(function () { audiosource.draw() }, 1000 / 30);
		};

		service.pause = function () {
			audio.pause();
			clearInterval(intv);
		};

		service.replay = function () {
			audio.currentTime = 0;
			audio.pause();
			audio.play();
			intv = setInterval(function () { audiosource.draw() }, 1000 / 30);
		};

		return service;
	}

	var SoundCloudAudioSource = function (audio) {
		var audioCtx = new (window.AudioContext || window.webkitAudioContext);
		var source = audioCtx.createMediaElementSource(audio);

		var analyser = audioCtx.createAnalyser();
		analyser.fftSize = 256;
		audio.crossOrigin = "anonymous";
		source.connect(analyser);
		analyser.connect(audioCtx.destination);

		this.bufferLength = analyser.frequencyBinCount;

		this.dataArray = new Uint8Array(this.bufferLength);

		this.draw = function () {
			analyser.getByteTimeDomainData(this.dataArray);
			drawCanvas(this.dataArray, this.bufferLength);
		};

	}

	function drawCanvas(dataArray, bufferLength) {
		var canvas = document.getElementById('visualizer');
		var canvasCtx = canvas.getContext("2d");

		var WIDTH = 300;
		var HEIGHT = 150;

		canvasCtx.fillStyle = 'rgb(0, 0, 0)';
		canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
		canvasCtx.lineWidth = 2;
		canvasCtx.beginPath();

		var sliceWidth = WIDTH * 1.0 / bufferLength;
		var x = 0;

		for (var i = 0; i < bufferLength; i++) {
			var data = dataArray[i];
			var v = data / 128.0;
			var y = v * HEIGHT / 2;

			var r = data + 60;
			var g = 255 - data;
			var b = data / 5;

			canvasCtx.strokeStyle = 'rgb(' + r + ', ' + g + ', ' + b + ')';

			if (i === 0) {
				canvasCtx.moveTo(x, y);
			} else {
				canvasCtx.lineTo(x, y);
			}

			x += sliceWidth;
		}
		canvasCtx.lineTo(canvas.width, canvas.height / 2);
		canvasCtx.stroke();
	}

	angular.module('SmartMirror')
    .factory('SoundCloudService', SoundCloudService);

} ());
