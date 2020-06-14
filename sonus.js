"use strict";
// Load in smart mirror config
const os = require("os");
const fs = require("fs");
const path = require("path");
let config;
try {
	config = require("./config.json");
} catch (e) {
	config = false;
}

if (
	!config ||
	!config.speech ||
	!config.speech.keyFilename ||
	!config.speech.hotwords ||
	!config.general.language
) {
	throw "Configuration Error! See: https://docs.smart-mirror.io/docs/configure_the_mirror.html#speech";
}

var keyFile = JSON.parse(
	fs.readFileSync(path.resolve(config.speech.keyFilename), "utf8")
);

// Configure Sonus
const Sonus = require("sonus");
const speech = require("@google-cloud/speech");
const client = new speech.SpeechClient({
	projectId: keyFile.project_id,
	keyFilename: config.speech.keyFilename,
});

// Hotword helpers
let sensitivity = config.speech.sensitivity || "0.5";
let hotwords = [];
let addHotword = function (modelFile, hotword, sensitivity) {
	let file = path.resolve(modelFile);
	if (fs.existsSync(file)) {
		hotwords.push({ file, hotword, sensitivity });
	} else {
		console.log('Model: "', file, '" not found.');
	}
};

for (let i = 0; i < config.speech.hotwords.length; i++) {
	addHotword(
		config.speech.hotwords[i].model,
		config.speech.hotwords[i].keyword,
		sensitivity
	);
}

const language = config.general.language;
const recordProgram =
	os.arch().startsWith("arm") |
	(os.arch == "x64" && os.platform() !== "darwin")
		? "arecord"
		: "rec";
const device = config.speech.device != "" ? config.speech.device : "default";
const sonus = Sonus.init({ hotwords, language, recordProgram, device }, client);

// Start Recognition
Sonus.start(sonus);

// Event IPC
sonus.on("hotword", (index) => console.log("!h:", index));
sonus.on("partial-result", (result) => console.log("!p:", result));
sonus.on("final-result", (result) => console.log("!f:", result));
sonus.on("error", (error) => console.error("!e:", error));

// add support for plugins needing conversational voice support
// need something that contains the plugin schemas
if (config.assistant | true) {
	const express = require("express");
	const app = express();
	const server = require("http").createServer(app);

	// Start the server, 1 up from config
	server.listen(parseInt(config.remote.port) - 1);
	var control = {};
	control.io = require("socket.io")(server);

	control.io.on("connection", function (socket) {
		//console.log("connected")
		socket.emit("connected");

		socket.on("stop", function () {
			Sonus.stop();
			socket.emit("stopped");
		});
		socket.on("start", function () {
			Sonus.start(sonus);
			socket.emit("started");
		});
		socket.on("getinfo", function () {
			//console.log("sending info")
			socket.emit("info", { language, recordProgram, device });
		});
	});
}
