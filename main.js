
	}
	console.log(error)
if (config.remote && config.remote.enabled || firstRun) {
	remote.start()

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	app.quit()
})

// No matter how the app is quit, we should clean up after ourselvs
app.on('will-quit', function () {
	if (kwsProcess) {
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
