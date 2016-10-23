'use strict'

const argKeyfile = process.argv[2] || "./keyfile.json"
const argModel = process.argv[3] || "smart_mirror.pmdl"
const argLanguage = process.argv[4] || "en-US"
const argSensitivity = process.argv[5] || "0.5"

const Sonus = require('sonus')
const speech = require('@google-cloud/speech')({
  projectId: 'streaming-speech-sample',
  keyFilename: argKeyfile
})

const hotwords = [{ file: argModel, hotword: 'hotword', sensitivity:  argSensitivity}]
const language = argLanguage
const sonus = Sonus.init({ hotwords, language }, speech)

Sonus.start(sonus)

sonus.on('hotword', (index, keyword) => console.log("!h:", index))
sonus.on('partial-result', result => console.log("!p:", result))
sonus.on('final-result', result => console.log("!f:", result))
sonus.on('error', error => console.error("!e:", error))
