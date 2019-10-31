'use strict'
const fs = require('fs');
const path = require('path');
const detectionDir='./motion';
const detectionFile='detected';
// Load in smart mirror config
var config = require("./config.json")

if(!config || !config.motion || !config.motion.enabled || !config.motion.pin || !config.general.language){
	console.log("!E:","Configuration Error! See: https://docs.smart-mirror.io/docs/configure_the_mirror.html#motion")
}

if (config.motion.enabled == "pin" && require.resolve('johnny-five').length > 0 && require.resolve('raspi-io').length > 0 ) {

	// Configure johnny-five
	var five = require('johnny-five');
	var Raspi = require("raspi-io");
	var board = new five.Board({
		io: new Raspi()
	});

	board.on("ready",function() {
		
		var motion = new five.Motion(config.motion.pin);
			
		// "calibrated" occurs once, at the beginning of a session,
		motion.on("calibrated", function() {
			console.log("!c:","calibrated");
		});

		// "motionstart" events are fired when the "calibrated"
		// proximal area is disrupted, generally by some form of movement
		motion.on("motionstart", function() {
			console.log("!s:","motionstart");
		});

		// "motionend" events are fired following a "motionstart" event
		// when no movement has occurred in X ms
		motion.on("motionend", function() {
			console.log("!e:","motionend");
		});
	});
} else if ( config.motion.enabled === "pin"){
	console.error("!E:","Motion Dependencies are missing! Therefore despite my best efforts I'll have to disable motion, Dave. This is most embarrassing for us both.")
} else if ( config.motion.enabled == "external"){
	// check to see if the external motion event folder exists
	fs.access(detectionDir, function(err) {
		// if not
		if (err && err.code === 'ENOENT') {
			// create it
			fs.mkdir(detectionDir , function(){
				console.debug('created motion directory', detectionDir);
			});
		}
		else{
			// make sure the directory is empty
			rmDir(detectionDir,false);
		}
		// change detector function
		// watch for a file to appear in the folder
		fs.watch(detectionDir, (eventType, filename) => {
			if (filename) {
				// remove the file
				fs.unlink(path.join(detectionDir,filename), function(error) { 
					// consume the enonet error
					if(error == null){
						//console.debug('motion detected from external source');
						// if the start motion file
						if(filename === detectionFile) {
							// signal motion started
							console.log("!s:","motionstart");
						}
						else {
							// signal motion ended 
							console.log("!e:","motionend");
						}
					}
				});
			} else {
				console.log('filename not provided');
			}
		});
	});
}    
var  rmDir = function(dirPath, removeSelf) {
	if (removeSelf === undefined)
	{removeSelf = true;}
	try { var files = fs.readdirSync(dirPath); }
	catch(e) { return; }
	if (files.length > 0)
	{for (var i = 0; i < files.length; i++) {
		var filePath = dirPath + '/' + files[i];
		if (fs.statSync(filePath).isFile())
		{fs.unlinkSync(filePath);}
		else
		{rmDir(filePath);}
	}}
	if (removeSelf)
	{fs.rmdirSync(dirPath);}
};

