'use strict'

// Load in smart mirror config
const config = require(__dirname + "/config.js")
if(!config || !config.speech || !config.speech.keyFilename || !config.speech.model || !config.language){
  throw "Configuration Error! See: https://docs.smart-mirror.io/docs/configure_the_mirror.html#speech"
}

// Configure Sonus
const Sonus = require('sonus')
const speech = require('@google-cloud/speech')({
  projectId: config.speech.projectId,
  keyFilename: config.speech.keyFilename
})

const hotwords = [{ file: config.speech.model, hotword: config.speech.keyword, sensitivity:  config.speech.sensitivity || '0.5'}]
const language = config.language
const sonus = Sonus.init({ hotwords, language }, speech)

// Start Recognition
Sonus.start(sonus)

// Event IPC
sonus.on('hotword', (index, keyword) => console.log("!h:", index))
sonus.on('partial-result', result => console.log("!p:", result))
sonus.on('final-result', result => console.log("!f:", result))
sonus.on('error', error => console.error("!e:", error))
