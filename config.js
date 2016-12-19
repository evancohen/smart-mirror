(function(){

  var config = ""
  var configMaster = "" 
  var configJSON = ""
  var configFN = __dirname + "/config.json"
  var configMasterFN = __dirname + "/remote/config.master.json"
  var configJsonFN = __dirname + "/remote/config.schema.json"

  function getFiles(){
    configMaster = JSON.parse($rootScofs.readFileSync(configMasterFN,"utf8"))

    if ($rootScope.fs.existsSync(configFN)){
      try {
        config = JSON.parse(fs.readFileSync(configFN,"utf8")) //json'd config file
      } catch (e) {
        config = configMaster
      }
    } else {
      config = configMaster
    }
    configMaster = JSON.parse(fs.readFileSync(configMasterFN,"utf8"))
  }


getFiles()
// DO NOT REMOVE
if (typeof module !== 'undefined') {module.exports = config;}
})