'use strict'
// Load in smart mirror config
const fs = require('fs')
var config = require(__dirname + "/config-index.js")

if(!config || !config.speech || !config.speech.keyFilename || !config.speech.hotwords[0].model || !config.general.language){
  throw "Configuration Error! See: https://docs.smart-mirror.io/docs/configure_the_mirror.html#speech"
}

var keyFile = JSON.parse(fs.readFileSync(config.speech.keyFilename,"utf8"))

// Configure Sonus
const Sonus = require('sonus')
const speech = require('@google-cloud/speech')({
  projectId: keyFile.project_id,
  keyFilename: config.speech.keyFilename
})

let hotwords = []


for(let i =0; i < config.speech.hotwords.length; i++){
    if (fs.existsSync(config.speech.hotwords[i].model)) {    
      hotwords.push({ file: config.speech.hotwords[i].model, hotword: config.speech.hotwords[i].keyword, sensitivity:  config.speech.sensitivity || '0.5'})
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
