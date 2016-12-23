  const fs = require('fs')
  var config = ""
  var configDefault = "" 
  var configSchema = ""
  var configJson
  var configJsonPath = __dirname + "/config.json"
  var configJsPath = __dirname + "/config.js"
  var configOldJsPath = __dirname + "/config.old.js"
  var configDefaultPath = __dirname + "/remote/config.default.json"
  var configSchemaPath = __dirname + "/remote/config.schema.json"

  function getFiles(){

    if (fs.existsSync(configDefaultPath)) {
      configDefault = JSON.parse(fs.readFileSync(configDefaultPath,"utf8"))
    } 
    if (fs.existsSync(configJsonPath)){
      config = JSON.parse(fs.readFileSync(configJsonPath,"utf8"))
    } else {
      if (fs.existsSync(configJsPath)) {
        config = require(configJsPath)
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
        fs.writeFileSync(configJsonPath,JSON.stringify(config,null,2),"utf8")
        if (fs.existsSync(configJsonPath)){
          fs.renameSync(configJsPath,configOldJsPath)
        }
      } else {
        config = configDefault
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
