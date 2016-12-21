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
        if (Array.isArray(config.greeting)){
          config.general = {language:config.language,layout:config.layout,greeting:{midday:config.greeting,evening:config.greeting,morning:config.greeting,night:config.greeting}}
        } else {
          config.general = {language:config.language,layout:config.layout,greeting:config.greeting}
        }
        importHotwords(config.speech, config.speech.keyword, config.speech.model)
        delete config.language
        delete config.layout
        delete config.greeting
        delete config.speech.keyword
        delete config.speech.model
        fs.writeFileSync(configJsonFN,JSON.stringify(config,null,2),"utf8")
        if (fs.existsSync(configJsonFN)){
          fs.renameSync(configJsFN,configOldJsFN)
        }
      } else {
        config = configMaster
      }
    }

    
  }
function importHotwords(obj, kwd, mdl){
  obj.hotwords = []
  if (Array.isArray(kwd) && Array.isArray(mdl)) {
    if (kwd.length > mdl.length) {
      var c = kwd.length
    } else {
      var c = mdl.length
    }
      for (var i = 0 ; i < c; i++ ){
        if (!kwd[i]){
          obj.hotwords.push({keyword:"unknown",model:mdl[i]})
        } else if (mdl[i]) {
          obj.hotwords.push({keyword:kwd[i],model:mdl[i]})
        }
      }
  } else {
    obj.hotwords.push({keyword:kwd,model:mdl})    
  }
}

getFiles()
// DO NOT REMOVE
if (typeof module !== 'undefined') {module.exports = config;}
