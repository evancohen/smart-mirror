/* global $, io */

$(function () {

	// global vars
	var pos = window.location.href.substr(window.location.href.lastIndexOf("/") + 1)
	var socket = io()
	var $connectionBar = $('#connection-bar')
	var $connectionText = $('#connection-text')
	// index vars	
	var $speak = $('#speak')
	var $nospeak = $('#no-speak')
	var $commandBox = $('#command-box')
	// config vars
	var timeoutID
	// audio vars
	var audCount = 0
	var formObject = {
		"schema": {	
			"record": { "type": "string", "title": "Select <strong>Recording</strong> Device", "enum": []}, 
			"play": { "type": "string","title": "Select <strong>Playback</strong> Device", "enum": []}, 
			"amixer": { "type": "string","title": "Select which device to <strong>FORCE</strong> audio out of:","enum": ["3 1", "3 2"]}
		},
		"form": [
			{"key": "record", "titleMap": {}},
			{"key": "play", "titleMap": {}},
			{"key": "amixer", "titleMap": {"3 1": "3.5 Headphone Jack", "3 2": "HDMI Audio"}},
			{ "type": "button", "title": "Submit"}
		],
		resetObj: function () {
			this.schema.record.enum = []
			this.schema.play.enum = []
			this.form.forEach(function (formItm) {
				if (formItm.key == "play") {
					formItm.titleMap={}
				}
				if (formItm.key == "record") {
					formItm.titleMap={}
				}
			})
		}
	}

	/*
	
	   _____ _ _      _         _______ _                            
	  / ____| (_)    | |       / / ____| |                           
	 | |    | |_  ___| | __   / / |    | |__   __ _ _ __   __ _  ___ 
	 | |    | | |/ __| |/ /  / /| |    | '_ \ / _` | '_ \ / _` |/ _ \
	 | |____| | | (__|   <  / / | |____| | | | (_| | | | | (_| |  __/
	  \_____|_|_|\___|_|\_\/_/   \_____|_| |_|\__,_|_| |_|\__, |\___|
														   __/ |     
														  |___/      
	
	*/

	// index clicks
	$('#command-bttn').click(function () {
		$('#speech-error').hide()
		var x = $commandBox.val();
		$commandBox.val('')
		socket.emit('clickWakeUp')
		socket.emit('command', x)
	})

	$('#devtools').change(function () {
		socket.emit('devtools', $(this).is(":checked"))
	});

	$('#kiosk').click(function () {
		socket.emit('kiosk')
	});

	$('#reload').click(function () {
		socket.emit('reload')
	})

	$('#wakeUp').click(function () {
		socket.emit('clickWakeUp')
	})

	$('#sleep').click(function () {
		socket.emit('clickSleep')
	})

	// config & audio clicks
	$('#outClose').click(function () {
		clearTimeout(timeoutID)
		hideElm('#out')
	});

	/*
	
	   _____            _        _     ______               _       
	  / ____|          | |      | |   |  ____|             | |      
	 | (___   ___   ___| | _____| |_  | |____   _____ _ __ | |_ ___ 
	  \___ \ / _ \ / __| |/ / _ \ __| |  __\ \ / / _ \ '_ \| __/ __|
	  ____) | (_) | (__|   <  __/ |_  | |___\ V /  __/ | | | |_\__ \
	 |_____/ \___/ \___|_|\_\___|\__| |______\_/ \___|_| |_|\__|___/
																    
																    
	
	*/

	// global socket events
	socket.on('connected', function () {
		$connectionBar.removeClass('disconnected').addClass('connected')
		$connectionText.html('Connected!')
		socket.emit("checkRaspbian")
		switch (pos.toLowerCase()) {
		case "config.html?p=audio":
			audio_init()
			break;
		case "config.html":
		case "config.html?p=mirror":
			config_init()
			break;
		default:
			index_init()
		}
	})

	socket.on('disconnect', function () {
		$connectionBar.removeClass('connected').addClass('disconnected')
		$connectionText.html('Disconnected :(')
	})

	socket.on('raspbian', function () {
		$('#audioSettings').removeClass('hidden')
	})

	// index socket events
	socket.on('loadAnnyAng', function (data) {
		annyang.setLanguage(data)
		annyang.debug(false)
		$nospeak.addClass('hidden')
		$speak.removeClass('hidden')

		var command = {
			'*command': function (command) {
				socket.emit('clickWakeUp')
				socket.emit('command', command)
				$speak.removeClass('redMic')
			}
		}

		annyang.addCallback('error', function (error) {
			console.log(error)
			$('#speech-error').text('Unsupported on iOS/Safari');
			$('#speech-error').show()
		})

		// Add our commands to annyang
		annyang.addCommands(command)

		// Start listening. You can call this here, or attach this call to an event, button, etc.
		$('#speak').click(function () {
			$('#speech-error').hide()
			console.log('listening...')
			annyang.start({ autoRestart: false, continuous: false })
			$speak.addClass('redMic')
		})
	})

	// config socket events
	socket.on('json', function (data) {
		data.configJSON.value = $.extend({}, data.configDefault, data.config)
		console.log(data);
		data.configJSON.form.push({ "type": "button", "title": "Submit", "order": 10000 })
		console.log(data);

		try {
			data.configJSON.onSubmitValid = function (values) {
				if (console && console.log) {
					console.log('Values extracted from submitted form', values);
					console.log(JSON.stringify(values, null, 2))

				}
				socket.emit('saveConfig', values)
			};
			data.configJSON.onSubmit = function (errors) {
				if (errors) {
					console.log('Validation errors', errors);
					let buildInner = ""
					errors.forEach(function (errItem) {
						let errSchemaUri = errItem.schemaUri.replace(/.+\/properties\//, "").replace("/", " >> ")
						buildInner += `<p><strong style="font-color:red">Error: ` + errItem.message +
							"</strong></br>Location: " +
							errSchemaUri +
							"</p>"
					})
					$('#outMsg').html(buildInner)
					showElm('#out', 1)
					console.log('Validation errors', errors);
					return false;
				}
				return true;
			};
			console.log('items in data.configJSON', data.configJSON)
			$('#result').html('<form id="result-form" class="form-vertical"></form>');
			$('#result-form').jsonForm(data.configJSON);
		}
		catch (e) {
			$('#result').html('<pre>Entered content is not yet a valid' +
				' JSON Form object.\n\nThe JSON Form library returned:\n' +
				e.stack + '</pre>');
			console.error("error stack", e.stack)
			return;
		}
	})

	socket.on("saved", function (msg) {
		if (!msg) {
			msg = "I Could not save your configuration. Don't give me that look, I'm just as sad about it as you are."
		}
		$('#outMsg').html("<p><strong>"+msg+"</strong></p>")
		showElm('#out', 1)
	})

	//audio socket events
	socket.on("loadAudio", function (mode, data) {
		if (mode != "NA") {
			data.forEach(function (dataItm) {
				formObject.schema[mode].enum.push(dataItm.hwID)
				formObject.form.forEach(function (formItm) {
					if (formItm.key == mode) {
						formItm.titleMap[dataItm.hwID]=dataItm.desc
					}
				})
			})
			audCount+=1
			processAudio()
		} else {
			hideElm('#result')
			$('#outMsg').html("<p><strong>You only need to configure audio for the Raspberry Pi</strong></p>")
			showElm('#out', 1)
		}
	})

	/*
	
	  ______                _   _                 
	 |  ____|              | | (_)                
	 | |__ _   _ _ __   ___| |_ _  ___  _ __  ___ 
	 |  __| | | | '_ \ / __| __| |/ _ \| '_ \/ __|
	 | |  | |_| | | | | (__| |_| | (_) | | | \__ \
	 |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
												  
												  
	
	*/

	// global functions
	function isIosDevice() {
		var iosDeviceList = [
			"iPhone", "iPod", "iPad", "iPhone Simulator", "iPod Simulator",
			"iPad Simulator", "Pike v7.6 release 92", "Pike v7.8 release 517"
		]
		return iosDeviceList.some(function (device) {
			return device == navigator.platform
		})
	}

	function index_init() {
		if (isIosDevice()) {
			$speak.addClass('hidden')
			$nospeak.removeClass('hidden')
		}
		if (annyang) {
			socket.emit('getAnnyAng')
		}
	}

	function audio_init() {
		audCount = 0
		formObject.resetObj()
		socket.emit('getAudioDevices')
	}

	function config_init() {
		socket.emit('getForm', true)
	}

	// config functions
	function hideElm(element) {
		$(element).fadeOut("fast")
	}
	function showElm(element, timeOutMins = 1) {
		var timeOutMillis = timeOutMins * 60000
		$(element).fadeIn()
		timeoutID = setTimeout(function () {
			hideElm(element);
		}, timeOutMillis)
	}

	// audio functions
	function processAudio() {
		if (audCount == 2) {
			loadAudioForm()
		}
	}

	function loadAudioForm () {
		try {
			formObject.onSubmitValid = function (values) {
				if (console && console.log) {
					console.log('Values extracted from submitted form', values);
					console.log(JSON.stringify(values, null, 2))
				}
				socket.emit("saveAudio", values)
			};
			formObject.onSubmit = function (errors) {
				if (errors) {
					console.log('Validation errors', errors);
					let buildInner = ""
					errors.forEach(function (errItem) {
						let errSchemaUri = errItem.schemaUri.replace(/.+\/properties\//, "").replace("/", " >> ")
						buildInner += `<p><strong style="font-color:red">Error: ` + errItem.message +
							"</strong></br>Location: " +
							errSchemaUri +
							"</p>"
					})
					$('#outMsg').html(buildInner)
					showElm('#out', 1)
					console.log('Validation errors', errors);
					return false;
				}
				return true;
			};
			$('#result').html('<form id="result-form" class="form-vertical"></form>');
			$('#result-form').jsonForm(formObject);
		}
		catch (e) {
			$('#result').html('<pre>Entered content is not yet a valid' +
				' JSON Form object.\n\nThe JSON Form library returned:\n' +
				e.stack + '</pre>');
			console.error("error stack", e.stack)
			return;
		}
	}



})