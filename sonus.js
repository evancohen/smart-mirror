'use strict'
// Load in smart mirror config
const os = require('os');
const fs = require('fs')
const path = require('path')
let config
try {
	config = require("./config.json")
} catch (e) {
	config = false
}

if (!config || !config.speech || !config.speech.keyFilename || !config.speech.hotwords || !config.general.language) {
	throw "Configuration Error! See: https://docs.smart-mirror.io/docs/configure_the_mirror.html#speech"
}

var keyFile = JSON.parse(fs.readFileSync(path.resolve(config.speech.keyFilename), "utf8"))

// Configure Sonus
const Sonus = require('sonus')
const speech = require('@google-cloud/speech')({
	projectId: keyFile.project_id,
	keyFilename: config.speech.keyFilename
})

// Hotword helpers
let sensitivity = config.speech.sensitivity || '0.5'
let hotwords = []
// used for arecord bug workaround
let emptybufferCounter=0;
let timer=null
//
let addHotword = function (modelFile, hotword, sensitivity) {
	let file = path.resolve(modelFile)
	if (fs.existsSync(file)) {
		hotwords.push({ file, hotword, sensitivity })
	} else {
		console.log('Model: "', file, '" not found.')
	}
}

for (let i = 0; i < config.speech.hotwords.length; i++) {
	addHotword(config.speech.hotwords[i].model, config.speech.hotwords[i].keyword, sensitivity)
}


const language = config.general.language
const recordProgram = (os.arch() == 'arm') ? "arecord" : "rec"
const device = (config.speech.device != "") ? config.speech.device : 'default'
let sonus=0;

// call worker routine to do the reco setup, routine may be called again to recover from hung pcm reader
recycle_recorder()
// startup the reco handler
// note we might call this again if the pcm reader gets hung
function recycle_recorder(){
	// if we have a timer running which caused this entry
	if(timer!=null){
		// stop the timer
		clearInterval(timer);
		// clear the timer handle
		timer=null;
	}
	// if we are recording
  if(record_started)
		// stop  this will kill the stuck arecord process
	  Sonus.stop()
	// do all the setup over again
  sonus = Sonus.init({ hotwords, language, recordProgram, device }, speech)
	// set the Event IPC handlers
	sonus.on('hotword', (index) => console.log("!h:", index))
	sonus.on('partial-result', result => console.log("!p:", result))
	sonus.on('final-result', result => console.log("!f:", result))
	sonus.on('error', error => console.error("!e:", error))
	// get size of sound data captured
	sonus.on('sound',function(dataSize) 
	{
		// the arecord process has a bug, where it will start sending empty wav 'files' over and over.
		// the only recovery is to kill that process, and start a new onerror
		// so we are looking for a bunch of consecutive empty pcm data buffers as the indicator that arecord is stuck
		// if there is no data, count it
		if(dataSize==0 && ++emptybufferCounter){
			// if we have 50 consecutive no data packets, then arecord is stuck
			if(emptybufferCounter>50){
				// setup the restart timer, as we are on a callback now
				timer=setInterval(recycle_recorder, 250);
				// and clear the consecutive counter
				emptybufferCounter=0;
			}	else{	
				// no data actually
				// reset the consecutive empty counter 
				emptybufferCounter=0;
			}
		}
	})

	// Start Recognition
	Sonus.start(sonus)
  record_started=true;
}