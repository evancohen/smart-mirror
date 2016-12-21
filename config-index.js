  const fs = require('fs')
  var config = ""
  var configMaster = "" 
  var configSchema = ""
  var configJson
  var configJsonFN = __dirname + "/config.json"
  var configJsFN = __dirname + "/config.js"
  var configOldJsFN = __dirname + "/config.old.js"
  var configMasterFN = __dirname + "/remote/config.master.json"
  var configSchemaFN = __dirname + "/remote/config.schema.json"

  function getFiles(){

    if (fs.existsSync(configMasterFN)) {
      configMaster = JSON.parse(fs.readFileSync(configMasterFN,"utf8"))
    } 
    if (fs.existsSync(configJsonFN)){
      config = JSON.parse(fs.readFileSync(configJsonFN,"utf8"))
    } else {
      if (fs.existsSync(configJsFN)) {
        config = require(configJsFN)
        if (typeof config.greeting == 'array'){
          config.general = {language:config.language,layout:config.layout,greeting:config.greeting}
        } else {
          config.general = {language:config.language,layout:config.layout,greeting:{midday:config.greeting,evening:config.greeting,morning:config.greeting,night:config.greeting}}
        }
        delete config.language
        delete config.layout
        delete config.greeting
        fs.writeFileSync(configJsonFN,JSON.stringify(config,null,2),"utf8")
        if (fs.existsSync(configJsonFN)){
          fs.renameSync(configJsFN,configOldJsFN)
        }
      } else {
        config = configMaster
      }
    }

    
  }


getFiles()
// DO NOT REMOVE
if (typeof module !== 'undefined') {module.exports = config;}
