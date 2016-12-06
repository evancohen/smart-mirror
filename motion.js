'use strict'

// Load in smart mirror config
const config = require(__dirname + "/config.js")
if(!config || !config.motion || !config.motion.enabled || !config.motion.pin || !config.language){
  throw "Configuration Error! See: https://docs.smart-mirror.io/docs/configure_the_mirror.html#motion"
}
if (config.motion.enabled) {
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
}