(function(window) {
    var AUDIO_RECORDER_WORKER = 'js/services/speech/audioRecorderWorker.js';
    var AudioRecorder = function(source, cfg) {
	this.consumers = [];
	var config = cfg || {};
	var errorCallback = config.errorCallback || function() {};
	var inputBufferLength = config.inputBufferLength || 4096;
	var outputBufferLength = config.outputBufferLength || 4000;
	this.context = source.context;
	this.node = this.context.createScriptProcessor(inputBufferLength);
	var worker = new Worker(config.worker || AUDIO_RECORDER_WORKER);
	worker.postMessage({
	    command: 'init',
	    config: {
		sampleRate: this.context.sampleRate,
		outputBufferLength: outputBufferLength,
		outputSampleRate: (config.outputSampleRate || 16000)
	    }
	});
	var recording = false;
	this.node.onaudioprocess = function(e) {
	    if (!recording) return;
	    worker.postMessage({
		command: 'record',
		buffer: [
		    e.inputBuffer.getChannelData(0),
		    e.inputBuffer.getChannelData(1)
		]
	    });
	};
	this.start = function(data) {
	    this.consumers.forEach(function(consumer, y, z) {
                consumer.postMessage({ command: 'start', data: data });
		recording = true;
		return true;
	    });
	    recording = true;
	    return (this.consumers.length > 0);
	};
	this.stop = function() {
	    if (recording) {
		this.consumers.forEach(function(consumer, y, z) {
                    consumer.postMessage({ command: 'stop' });
		});
		recording = false;
	    }
	    worker.postMessage({ command: 'clear' });
	};
	this.cancel = function() {
	    this.stop();
	};
	myClosure = this;
	worker.onmessage = function(e) {
	    if (e.data.error && (e.data.error == "silent")) errorCallback("silent");
	    if ((e.data.command == 'newBuffer') && recording) {
		myClosure.consumers.forEach(function(consumer, y, z) {
                    consumer.postMessage({ command: 'process', data: e.data.data });
		});
	    }
	};
	source.connect(this.node);
	this.node.connect(this.context.destination);
    };
    window.AudioRecorder = AudioRecorder;
})(window);
