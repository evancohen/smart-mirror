/* global __dirname */
/* global process */
const electron = require("electron")
// Child Process for keyword spotter
const {spawn, exec} = require("child_process")
// Smart mirror remote
const remote = require("./remote.js")
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
// Prevent the monitor from going to sleep.
const powerSaveBlocker = electron.powerSaveBlocker
powerSaveBlocker.start("prevent-display-sleep")

// Launching the mirror in dev mode
const DevelopmentMode = process.argv.includes("dev")

// Load the smart mirror config
let config
let firstRun = false
let kwsProcess = null
let quitting = false
try {
	config = require("./config.json")
} catch (e) {
	let error = "Unknown Error"
	config = require("./remote/.config.default.json")
	firstRun = true
	if (typeof e.code !== "undefined" && e.code === "MODULE_NOT_FOUND") {
		error = "'config.json' not found. \nYou can configure your mirror at the remote address below..."
	} else if (typeof e.message !== "undefined") {
		console.log(e)
		error = "Syntax Error. \nLooks like there's an error in your config file: " + e.message + "\n" +
      "Protip: You might want to paste your config file into a JavaScript validator like http://jshint.com/"
	}
	console.log(error)
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {

  // Get the displays and render the mirror on a secondary screen if it exists
	var atomScreen = electron.screen
	var displays = atomScreen.getAllDisplays()
	var externalDisplay = null
	for (var i in displays) {
		if (displays[i].bounds.x > 0 || displays[i].bounds.y > 0) {
			externalDisplay = displays[i]
			break
		}
	}

	var browserWindowOptions = { width: 800, height: 600, icon: "favicon.ico", kiosk: !DevelopmentMode, autoHideMenuBar: true, darkTheme: true }
	if (externalDisplay) {
		browserWindowOptions.x = externalDisplay.bounds.x + 50
		browserWindowOptions.y = externalDisplay.bounds.y + 50
	}

  // Create the browser window.
	mainWindow = new BrowserWindow(browserWindowOptions)

  // and load the index.html of the app.
	mainWindow.loadURL("file://" + __dirname + "/index.html")

  // Open the DevTools if run with "npm start dev"
	if (DevelopmentMode) {
		mainWindow.webContents.openDevTools()
	}

  // Emitted when the window is closed.
	mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
		mainWindow = null
	})
}

function startSonus()
{
  // Initilize the keyword spotter
	kwsProcess = spawn("node", ["./sonus.js"], { detached: false })
    // Handel messages from node
	kwsProcess.stderr.on("data", function (data) {
		var message = data.toString()
		console.error("ERROR", message.substring(4))
	})

	kwsProcess.stdout.on("data", function (data) {
		var message = data.toString()
		if (message.startsWith("!h:")) {
			mainWindow.webContents.send("hotword", true)
		} else if (message.startsWith("!p:")) {
			mainWindow.webContents.send("partial-results", message.substring(4))
		} else if (message.startsWith("!f:")) {
			mainWindow.webContents.send("final-results", message.substring(4))
		} else {
			console.error(message.substring(3))
		}
	})
    
    // if we receive a closed event from the keyword spotter
	kwsProcess.on("close", function() {
      // if main process is not ending
		if(quitting == false){
        // restart it
			startSonus();
		}
	})
}

// Initilize the keyword spotter
if (config && config.speech && !firstRun) {
	startSonus();
}

if (config.remote && config.remote.enabled || firstRun) {
	remote.start()

  // Deturmine the local IP address
	const interfaces = require("os").networkInterfaces()
	let addresses = []
	for (let k in interfaces) {
		for (let k2 in interfaces[k]) {
			let address = interfaces[k][k2]
			if (address.family === "IPv4" && !address.internal) {
				addresses.push(address.address)
			}
		}
	}
	console.log("Remote listening on http://%s:%d", addresses[0], config.remote.port)

	remote.on("command", function (command) {
		mainWindow.webContents.send("final-results", command)
	})

	remote.on("connected", function () {
		mainWindow.webContents.send("connected")
	})

	remote.on("disconnected", function () {
		mainWindow.webContents.send("disconnected")
	})

	remote.on("devtools", function (open) {
		if (open) {
			mainWindow.webContents.openDevTools()
		} else {
			mainWindow.webContents.closeDevTools()
		}
	})

	remote.on("kiosk", function () {
		if (mainWindow.isKiosk()) {
			mainWindow.setKiosk(false)
		} else {
			mainWindow.setKiosk(true)
		}
	})

	remote.on("reload", function () {
		mainWindow.reload()
	})
    
	remote.on("wakeUp", function () {
		mainWindow.webContents.send("remoteWakeUp", true)
	})
	remote.on("sleep", function () {
		mainWindow.webContents.send("remoteSleep", true)
	})

	remote.on("relaunch", function() {
		console.log("Relaunching...")
		app.relaunch()
		app.quit()
	})
}

// Motion detection
if(config.motion && config.motion.enabled){
	var mtnProcess = spawn("npm", ["run","motion"], {detached: false})
    // Handel messages from node
	mtnProcess.stderr.on("data", function (data) {
		var message = data.toString()
		console.error("ERROR", message.substring(4))
	})

	mtnProcess.stdout.on("data", function (data) {
		var message = data.toString()
		if (message.startsWith("!s:")) {
			console.log(message.substring(3))
			mainWindow.webContents.send("motionstart", true)
		} else if (message.startsWith("!e:")) {
			console.log(message.substring(3))
			mainWindow.webContents.send("motionend", true)
		} else if (message.startsWith("!c:")) {
			console.log(message.substring(3))
			mainWindow.webContents.send("calibrated", true)
		} else if (message.startsWith("!E:")) {
			console.log(message.substring(3))
			mainWindow.webContents.send("Error", message.substring(3))
			mtnProcess.kill();
		}  else {
			console.error(message)
		}
	})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow)

// Quit when all windows are closed.
app.on("window-all-closed", function () {
	app.quit()
})

// No matter how the app is quit, we should clean up after ourselvs
app.on("will-quit", function () {
	if (kwsProcess) {
		quitting=true
		kwsProcess.kill()
	}
  // While cleaning up we should turn the screen back on in the event 
  // the program exits before the screen is woken up
	if (mtnProcess) {
		mtnProcess.kill()
	}
	if (config.autoTimer && config.autoTimer.mode !== "disabled" && config.autoTimer.wakeCmd) {
		exec(config.autoTimer.wakeCmd).kill()
	}
})
