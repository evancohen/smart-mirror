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

	// do all the setup over again
	sonus = Sonus.init({ hotwords, language, recordProgram, device }, speech)
	// set the Event IPC handlers
	sonus.on('hotword', (index) => console.log("!h:", index))
	sonus.on('partial-result', result => console.log("!p:", result))
	sonus.on('final-result', result => console.log("!f:", result))
	sonus.on('error', error => {
		console.error("!e:", error)
	})

	// if the reco engine closes on its own
	sonus.on('close', /*close*/) => {
		// if we are not already in recovery mode
		if(timer==null){
			// the process has ended 
			// set value to prevent recursion
			timer=1
			// stop the reco processing, clean up
			Sonus.stop()
			emptybufferCounter=0;
			// setup to restart reco
			timer=setInterval(recycle_recorder, 200);
		}
	})
	sonus.on('end', /*end*/ => {
		// place holder for end notification
	})
	// if silence, reset the consecutive empty data buffer counter
	sonus.on('silence',() =>{emptybufferCounter=0;});
	// get size of sound data captured
	sonus.on('sound',function(dataSize) 
	{
		// only process sound events if we are not in recovery mode, otherwise we get a random segment fault
		if(timer==null){
			// the arecord process has a bug, where it will start sending empty wav 'files' over and over.
			// the only recovery is to kill that process, and start a new one
			// so we are looking for a set of consecutive empty 
			//	(or very small data, testing shows 8, 12, and 44 byte buffers) 
			// pcm data buffers as the indicator that arecord is stuck
			// if there is no data, count it
			if((dataSize<100) && (++emptybufferCounter)){
				// if we have 20 consecutive no data packets, then arecord is stuck
				if(emptybufferCounter>20){
					// stop reco, this will force kill the pcm application
					Sonus.stop()
					// and clear the consecutive buffer counter
					emptybufferCounter=0;
					// setup the restart timer, as we are on a callback now
					timer=setInterval(recycle_recorder, 100);
				}	
			} else{
				// have data
				// reset the consecutive empty counter 
				emptybufferCounter=0;
			}
		}
	})
	// clear counter
	emptybufferCounter=0;
	// Start Recognition
	Sonus.start(sonus)
}