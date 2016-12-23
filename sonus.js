'use strict'

// Load in smart mirror config
const fs = require('fs')
var config = require("./config.json")


if (!config || !config.speech || !config.speech.keyFilename || !config.speech.hotwords || !config.general.language) {
  throw "Configuration Error! See: https://docs.smart-mirror.io/docs/configure_the_mirror.html#speech"
}

var keyFile = JSON.parse(fs.readFileSync(config.speech.keyFilename, "utf8"))
var umdl = __dirname + '/node_modules/sonus/resources/snowboy.umdl'

// Configure Sonus
const Sonus = require('sonus')
const speech = require('@google-cloud/speech')({
  projectId: keyFile.project_id,
  keyFilename: config.speech.keyFilename
})

// Hotword helpers
let sensitivity = config.speech.sensitivity || '0.5'
let hotwords = []
let addHotword = function (file, hotword, sensitivity) {
  if (fs.existsSync(file)) {
    hotwords.push({ file, hotword, sensitivity })
  } else {
    hotwords.push({ file: umdl, hotword: 'snowboy', sensitivity })
  }
}

// Add our hotwords
if (typeof config.speech.model == 'string') {
  // Backwords compatability
  addHotword(config.speech.model, config.speech.keyword, sensitivity)
} else {
  for (let i = 0; i < config.speech.hotwords.length; i++) {
    addHotword(config.speech.hotwords[i].model, config.speech.hotwords[i].keyword, sensitivity)
  }
}


const language = config.general.language
const sonus = Sonus.init({ hotwords, language }, speech)

// Start Recognition
Sonus.start(sonus)

// Event IPC
sonus.on('hotword', (index, keyword) => console.log("!h:", index))
sonus.on('partial-result', result => console.log("!p:", result))
sonus.on('final-result', result => console.log("!f:", result))
sonus.on('error', error => console.error("!e:", error))
