/**
 * smart-mirror remote by Evan Cohen
 */
const stream = require('stream')
const _ = require('lodash')
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
					checkForActiveChanged(config,data)
					remote.emit('relaunch', data)
				}
			})
		})

		socket.on('getForm', function () {
			getConfigSchema(config, function (configSchema) {
				configSchema.form.sort(function (a, b) { return a.order - b.order })
				configJSON = configSchema
				socket.emit("json", { "configJSON": configJSON, "configDefault": configDefault, "config": config })
			})
		})

	}) // end - connection

	function checkForActiveChanged(oldConfig,newConfig){
		// if the new plugin config, doesn't match the old
		let cleanup=false
		let ok = oldConfig.plugins
		let nk = newConfig.plugins			
		// if not the same content, something changed

		if(!_.isEqual(ok, nk)){
			// if same length
			if(ok.length===nk.length){
				// make hashs
				let okh = {}
				for (let e of ok){
					okh[e.name]=e
				}
				// of both arrays
				let nkh = {}
				for(let f of nk){
					nkh[f.name]=f
				}  
				// compare all the items for active the same
				for(let k of Object.keys(nkh)){
					if(okh[k].active !== nkh[k].active){
						// if one is different, done
						cleanup=true;
						break;
					}
				}
				// still nothing changed
				// some key name changed, don't really care about name
				// check active for all those keys
				if(cleanup == false){
					for(let l of Object.keys(okh)){
						if(okh[l].active !== nkh[l].active){							
							// if one is different, done
							cleanup=true;
							break;
						}
					}				
				}
			}
			else {
				cleanup=true
			}
			if(cleanup){
				let langfile=__dirname+"/app/locales/"+newConfig.general.language.trim().substring(0,2)+'c.json'
				fs.unlinkSync(langfile)		
			}
		}
	}
	/**
   * When a remote disconnects
   */
	remote.io.on('disconnect', function () {
		remote.emit('disconnected')
	})// end - disconnect
} // end - start

module.exports = remote
