'use strict'
var sleep = require('sleep-async')();
		var fs = require('fs')
		var DetectionDir='./motion';
		var DetectionFile=DetectionDir+'/detected';	
// Load in smart mirror config
var config = require("./config.json")
if(!config || !config.motion || !config.motion.enabled || (!config.motion.external && !config.motion.pin) || !config.general.language ){
  console.log("!E:","Configuration Error! See: https://docs.smart-mirror.io/docs/configure_the_mirror.html#motion")
}

if (config.motion.enabled == true){
	if(config.motion.external == true){
		// check to see if the external motion event folder exists
		fs.access(DetectionDir, function(err) {
			// if not
			if (err && err.code === 'ENOENT') {
				// create it
				fs.mkdir(DetectionDir);
				console.debug('created motion directory', DetectionDir);
			}
			fs.watch(DetectionDir, (eventType, filename) => {
				if (filename) {
					// remove the file
					fs.unlink(DetectionFile, function(error) { 
						// consume the enonet error
						if(error == null){
							// only need to wake up if asleep
							//if(Focus.get() === 'sleep') {
								//console.debug('motion detected from external source');
								// wake up now
								console.log("!s:","motionstart");
								sleep.sleep(2000,function(){
									console.log("!e:","motionend");
								});
							//}
						}
					});
				} else {
					console.log('filename not provided');
				}
			});
		});
	// not external motion detection, use hardware pin
	} else if(require.resolve('johnny-five').length > 0 && require.resolve('raspi-io').length > 0 ) {

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
	} else {
		console.error("!E:","Motion Dependencies are missing! Therefore despite my best efforts I'll have to disable motion, Dave. This is most embarrassing for us both.")
	}
}
