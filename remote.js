/**
 * smart-mirror remote by Evan Cohen
 */
const {exec} = require('child_process')
const {homedir} = require('os')
const {resolve} = require('path')
const stream = require('stream')
let remote = new stream.Writable()
remote.start = function () {
	const express = require('express')
	const app = express()
	const fs = require('fs')
	const getConfigSchema = require('./config.schema.js')

	let config = ""
	let configDefault = ""
	let configJSON = ""
	let configPath = __dirname + "/config.json"
	let configDefaultPath = __dirname + "/config.default.json"

	function getFiles() {
		configDefault = JSON.parse(fs.readFileSync(configDefaultPath, "utf8"))

		if (fs.existsSync(configPath)) {
			try {
				config = JSON.parse(fs.readFileSync(configPath, "utf8")) //json'd config file
			} catch (e) {
				config = configDefault
			}
		} else {
			config = configDefault
		}
		configDefault = JSON.parse(fs.readFileSync(configDefaultPath, "utf8"))
		//TODO this is async, all of the remote should be async too
		getConfigSchema(function (configSchema) {
			//configSchema.form.push({"type":"button","title":"Submit","order":10000})
			configSchema.form.sort(function (a, b) { return a.order - b.order })
			configJSON = configSchema
		})
	}
	getFiles()

	const server = require('http').createServer(app)

	// Start the server
	server.listen(config.remote.port)
	// Use the remote directory and initilize socket connection
	app.use(express.static(__dirname + '/remote'))
	remote.io = require('socket.io')(server)

	/**
	 * When the connection begins
	 */
	remote.io.on('connection', function (socket) {
		socket.emit('connected')

		// When the mirror recieves a remote command
		socket.on('command', function (command) {
			remote.emit('command', command)
		})

		socket.on('devtools', function (open) {
			remote.emit('devtools', open)
		})

		socket.on('kiosk', function () {
			remote.emit('kiosk')
		})

		socket.on('reload', function () {
			remote.emit('reload')
		})

		socket.on('clickWakeUp', function () {
			remote.emit('wakeUp')
		})
		socket.on('clickSleep', function () {
			remote.emit('sleep')
		})

		socket.on('getAnnyAng', function () {
			socket.emit('loadAnnyAng', (typeof config.general.language != 'undefined') ? config.general.language : 'en-US')
		})

		socket.on('saveConfig', function (data) { // used to save the form JSON
			fs.writeFile(configPath, JSON.stringify(data, null, 2), "utf8", function (err) {
				if (err) {
					console.error(err)
				} else {
					socket.emit("saved",'<img src="http://i.giphy.com/3otPoS81loriI9sO8o.gif"/></BR>Your configuration has been saved.')
					remote.emit('relaunch')
				}
			})
		})

		socket.on('saveAudio', function (data) {
			fs.readFile(resolve("./remote/.audio/asound.temp"), "utf8", function (err, fileData) {
				if (err) console.error(err);
				var newData= fileData.toString()
				newData = newData.replace("Playback_DevID", data.play).replace("Capture_DevID", data.record)
				if (!newData.includes("DevID")){
					fs.writeFile(homedir()+"/.asoundrc", fileData, "utf8", function (err) {
						if (!err) {
							exec('amixer cset numid='+data.amixer, function (err,stdout) {
								if (!err) {
									socket.emit("saved","Your Audio Configuration has been saved.")
									console.log(stdout)
								} else {
									socket.emit("saved",err)
								}
							})
						} else {
							socket.emit("saved",err)
						}
					})
				} else {
					socket.emit("saved")
				}
			})
		})

		function checkRaspbian (cb) {
			if (fs.existsSync(resolve('/etc/os-release'))) {
				exec('cat /etc/os-release', function (err, stdout) {
					if (stdout.includes("raspbian")) {
						cb(true)
					} else {
						cb(false)
					}
				})	
			} else {
				cb(false)
			}
		}
		
		function getAudioDevices(mode) {
			exec('a'+mode+' -l', function (err, stdout) {
				if (err) {
					console.error(err)
					switch (mode) {
					case "play":
						stdout = ["No Playback Devices Found"]
						break;
					case "record":
						stdout = ["No Recording Devices Found"]
						break;
					}
					return
				}
				socket.emit("loadAudio", mode, deviceParse(stdout))
				console.log(stdout)
			})
		}

		function deviceParse(data) {
			var devOut = []
			var lines
			lines = data.split("\n")
			lines.forEach(function (lineItm) {
				if (lineItm.startsWith("card")) {
					var hwID, desc
					hwID = lineItm.substring(lineItm.indexOf("card ") + "card ".length, lineItm.indexOf(":")) + ","
					hwID += lineItm.substring(lineItm.indexOf("device ") + "device ".length, lineItm.lastIndexOf(":"))
					desc = lineItm.replace(/(card [0-9]+: )|(, device [0-9]+:)/ig, "")
					devOut.push({ hwID, desc })
				}
			})
			return devOut
		}

		socket.on('checkRaspbian', function () {
			checkRaspbian (function (a) {
				if (a) {
					socket.emit("raspbian")
				}
			})
		})

		socket.on('getAudioDevices', function () {
			checkRaspbian (function (a) {
				if (a) {
					getAudioDevices("play")
					getAudioDevices("record")
				} else {
					socket.emit("loadAudio", "NA")
				}
			})
		});

		socket.on('getForm', function () {
			getFiles()
			socket.emit("json", { "configJSON": configJSON, "configDefault": configDefault, "config": config })
		})


	}) // end - connection

	/**
	 * When a remote disconnects
	 */
	remote.io.on('disconnect', function () {
		remote.emit('disconnected')
	})// end - disconnect
} // end - start

module.exports = remote
