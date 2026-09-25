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
// Sonus defaults audioGain to 2.0 (blend-era change). Snowboy's normal gain is 1.0.
const audioGain =
	config.speech.audioGain != null ? Number(config.speech.audioGain) : 1.0;
// Ignore back-to-back false triggers while Google streaming settles / speech continues.
const hotwordCooldownMs =
	config.speech.hotwordCooldownMs != null
		? Number(config.speech.hotwordCooldownMs)
		: 4000;
// After an empty Google final (likely false hotword), back off longer to cut fees.
const emptyFinalBackoffMs =
	config.speech.emptyFinalBackoffMs != null
		? Number(config.speech.emptyFinalBackoffMs)
		: 30000;

// Prefer the classic common.res that shipped with sonus for years,
// not the newer bugsounet snowboy/common.res the blend also added.
const sonusRoot = path.dirname(require.resolve("sonus/package.json"));
const classicResource = path.join(sonusRoot, "resources", "common.res");
const blendResource = path.join(sonusRoot, "snowboy", "common.res");
const resource = config.speech.resource
	? path.resolve(config.speech.resource)
	: fs.existsSync(classicResource)
		? classicResource
		: blendResource;

const sonus = Sonus.init(
	{
		hotwords,
		language,
		recordProgram,
		device,
		audioGain,
		resource,
		applyFrontend: false,
	},
	client
);

// Force frontend off. Detector only applies applyFrontend when truthy, so false
// would otherwise leave the native default untouched after the snowboy blend.
if (
	sonus.detector &&
	sonus.detector.nativeInstance &&
	typeof sonus.detector.nativeInstance.ApplyFrontend === "function"
) {
	sonus.detector.nativeInstance.ApplyFrontend(false);
}

// Cooldown wrapper: detector still emits, but we skip Google re-triggers.
let cooldownUntil = 0;
if (typeof sonus.trigger === "function") {
	const origTrigger = sonus.trigger.bind(sonus);
	sonus.trigger = (index, hotword) => {
		const now = Date.now();
		if (now < cooldownUntil) {
			return;
		}
		cooldownUntil = now + hotwordCooldownMs;
		return origTrigger(index, hotword);
	};
}

// Start Recognition
Sonus.start(sonus);

// Event IPC
sonus.on("hotword", (index) => console.log("!h:", index));
sonus.on("partial-result", (result) => console.log("!p:", result));
sonus.on("final-result", (result) => {
	const text = String(result || "").trim();
	// Empty finals strongly correlate with false hotwords.
	// Stretch cooldown so ambient speech doesn't immediately re-bill Google.
	if (!text) {
		cooldownUntil = Date.now() + emptyFinalBackoffMs;
	}
	console.log("!f:", result);
});
sonus.on("error", (error) => console.error("!e:", error));

// add support for plugins needing conversational voice support
// need something that contains the plugin schemas
if (config.assistant | config.alexa | true) {
	const express = require("express");
	const app = express();
	const server = require("http").createServer(app);

	// Start the server, 1 up from config
	server.listen(process.argv[2]);
	var control = {};
	const { Server } = require("socket.io");
	control.io = new Server(server, {
		cors: { origin: true },
	});

	control.io.on("connection", function (socket) {
		//console.log("connected")
		socket.emit("connected");

		socket.on("stop", function () {
			Sonus.stop(sonus);
			socket.emit("stopped");
		});
		socket.on("start", function () {
			Sonus.start(sonus);
			socket.emit("started");
		});
		socket.on("getinfo", function () {
			//console.log("sending info")
			socket.emit("info", {
				lang: language,
				reco: recordProgram,
				device: device,
			});
		});
	});
}
