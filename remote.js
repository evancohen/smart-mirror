/**
 * smart-mirror remote by Evan Cohen
 */
const stream = require('stream')
let remote = new stream.Writable()
remote.start = function () {
	const express = require('express')
	const app = express()
	const fs = require('fs')
	const getConfigSchema = require('./remote/config.schema.js')

	let config = ""
	let configDefault = ""
	let configJSON = ""
	let configPath = __dirname + "/config.json"
	let configDefaultPath = __dirname + "/remote/.config.default.json"

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
					remote.emit('relaunch')
				}
			})
		})

		socket.on('getForm', function () {
			getConfigSchema(function (configSchema) {
				configSchema.form.sort(function (a, b) { return a.order - b.order })
				configJSON = configSchema
				socket.emit("json", { "configJSON": configJSON, "configDefault": configDefault, "config": config })
			})
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
