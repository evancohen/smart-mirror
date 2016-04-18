function startup(onMessage) {
    self.onmessage = function(event) {
	var pocketsphinxJS = (event.data && event.data.length && (event.data.length > 0)) ? event.data : 'pocketsphinx.js';
	importScripts(pocketsphinxJS);
	self.onmessage = onMessage;
	self.postMessage({});
    }
};

startup(function(event) {
    switch(event.data.command){
    case 'initialize':
	initialize(event.data.data, event.data.callbackId);
	break;
    case 'addWords':
	addWords(event.data.data, event.data.callbackId);
	break;
    case 'addGrammar':
	addGrammar(event.data.data, event.data.callbackId);
	break;
    case 'addKeyword':
	addKeyword(event.data.data, event.data.callbackId);
	break;
    case 'start':
	start(event.data.data);
	break;
    case 'stop':
	stop();
	break;
    case 'process':
	process(event.data.data);
	break;
    }
});

var mySelf = this;
var post = function(message) {
    mySelf.postMessage(message);
};

var recognizer = undefined;
var buffer = undefined;

function initialize(data, clbId) {
    var config = new Module.Config();
    buffer = new Module.AudioBuffer();
    if (data) {
	while (data.length > 0) {
	    var p = data.pop();
	    if (p.length == 2) {
		config.push_back([p[0],p[1]]);
	    } else {
		post({status: "error", command: "initialize", code: "js-data"});
	    }
	}
    }
    var output;
    if(recognizer) {
	output = recognizer.reInit(config);
	if (output != Module.ReturnType.SUCCESS) post({status: "error", command: "initialize", code: output});
    } else {
	recognizer = new Module.Recognizer(config);
	if (recognizer == undefined) post({status: "error", command: "initialize", code: Module.ReturnType.RUNTIME_ERROR});
	else post({status: "done", command: "initialize", id: clbId});
    }
    config.delete();
};

function addWords(data, clbId) {
    if (recognizer) {
	var words = new Module.VectorWords();
	for (var i = 0 ; i < data.length ; i++) {
	    var w = data[i];
	    if (w.length == 2) words.push_back([w[0], w[1]]);
	}
	var output = recognizer.addWords(words);
	if (output != Module.ReturnType.SUCCESS) post({status: "error", command: "addWords", code: output});
	else post({id: clbId});
	words.delete();
    } else post({status: "error", command: "addWords", code: "js-no-recognizer"});
};

function addGrammar(data, clbId) {
    var output;
    if (recognizer) {
	if (data.hasOwnProperty('numStates') && data.numStates > 0 &&
	    data.hasOwnProperty('start') &&
	    data.hasOwnProperty('end') &&
	    data.hasOwnProperty('transitions') && data.transitions.length > 0) {
	    var transitions = new Module.VectorTransitions();
	    while (data.transitions.length > 0) {
		var t = data.transitions.pop();
		if (t.hasOwnProperty('from') && t.hasOwnProperty('to')) {
		    if (!t.hasOwnProperty('word')) t.word = "";
		    if (!t.hasOwnProperty('logp')) t.logp = 0;
		    transitions.push_back(t);
		}
	    }
	    var id_v = new Module.Integers();
	    output = recognizer.addGrammar(id_v, {start: data.start, end: data.end, numStates: data.numStates, transitions: transitions});
	    if (output != Module.ReturnType.SUCCESS) post({status: "error", command: "addGrammar", code: output});
	    else post({id: clbId, data: id_v.get(0), status: "done", command: "addGrammar"});
	    transitions.delete();
	    id_v.delete();
	} else post({status: "error", command: "addGrammar", code: "js-data"});
	
    } else post({status: "error", command: "addGrammar", code: "js-no-recognizer"});
};

function addKeyword(data, clbId) {
    var output;
    if (recognizer) {
	if (data.length > 0) {
	    var id_v = new Module.Integers();
	    output = recognizer.addKeyword(id_v, data);
	    if (output != Module.ReturnType.SUCCESS) post({status: "error", command: "addKeyword", code: output});
	    else post({id: clbId, data: id_v.get(0), status: "done", command: "addKeyword"});
	    id_v.delete();
	} else post({status: "error", command: "addKeyword", code: "js-data"});
	
    } else post({status: "error", command: "addKeyword", code: "js-no-recognizer"});
};

function start(id) {
    if (recognizer) {
	var output;
	if (id) {
	    output = recognizer.switchSearch(parseInt(id));
	    if (output != Module.ReturnType.SUCCESS) {
		post({status: "error", command: "switchgrammar", code: output});
		return;
	    }
	}
	output = recognizer.start();
	if (output != Module.ReturnType.SUCCESS)
	    post({status: "error", command: "start", code: output});
    } else {
	post({status: "error", command: "start", code: "js-no-recognizer"});
    }
};


function stop() {
    if (recognizer) {
	var output = recognizer.stop();
	if (output != Module.ReturnType.SUCCESS)
	    post({status: "error", command: "stop", code: output});
	else
	    post({hyp: recognizer.getHyp(), count: recognizer.getCount(), final: true});
    } else {
	post({status: "error", command: "stop", code: "js-no-recognizer"});
    }
};

function process(array) {
    if (recognizer) {
	while (buffer.size() < array.length)
	    buffer.push_back(0);
	for (var i = 0 ; i < array.length ; i++)
	    buffer.set(i, array[i]);
	var output = recognizer.process(buffer);
	if (output != Module.ReturnType.SUCCESS)
	    post({status: "error", command: "process", code: output});
	else 
	    post({hyp: recognizer.getHyp(), count: recognizer.getCount()}); 
    } else {
	post({status: "error", command: "process", code: "js-no-recognizer"});
    }
};
