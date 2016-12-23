/**
 * smart-mirror remote by Evan Cohen
 */
const stream = require('stream')
let remote = new stream.Writable()
remote.start = function () {
  const express = require('express')
  const app = express()
  const fs = require('fs')
  
  var config = ""
  var configMaster = ""
  var configJSON = ""
  var configFN = __dirname + "/config.json"
  var configMasterFN = __dirname + "/remote/config.master.json"
  var configJsonFN = __dirname + "/remote/config.schema.json"

  function getFiles(){
    configMaster = JSON.parse(fs.readFileSync(configMasterFN,"utf8"))

    if (fs.existsSync(configFN)){
      try {
        config = JSON.parse(fs.readFileSync(configFN,"utf8")) //json'd config file
      } catch (e) {
        config = configMaster
      }
    } else {
      config = configMaster
    }
    configMaster = JSON.parse(fs.readFileSync(configMasterFN,"utf8"))
    configJSON = JSON.parse(fs.readFileSync(configJsonFN,"utf8")) // holds the form schema
  }
  getFiles()

  const server = require('http').createServer(app)

  // Start the server
  server.listen(config.remote.port)
  // Use the remote directory and initilize socket connection
  app.use(express.static(__dirname + '/remote'))
  remote.io = require('socket.io')(server)

  /**
   * When the connection begins
   */
  remote.io.on('connection', function (socket) {
    socket.emit('connected')

    // When the mirror recieves a remote command
    socket.on('command', function (command) {
      remote.emit('command', command)
    })

    socket.on('devtools', function (open) {
      remote.emit('devtools', open)
    })

    socket.on('kiosk', function () {
      remote.emit('kiosk')
    })

    socket.on('reload', function () {
      remote.emit('reload')
    })

    socket.on('saveForm', function(data){ // used to save the form JSON
      
    })
    
    socket.on('saveConfig', function(data){ // used to save the form JSON
      fs.writeFileSync(configFN,JSON.stringify(data,null,2),"utf8")
    })

    socket.on('getForm', function(clicked){
      getFiles()
      socket.emit("json",{"configJSON": configJSON,"configMaster":configMaster,"config":config})
    })
    
  }) // end - connection

  /**
   * When a remote disconnects
   */
  remote.io.on('disconnect', function () {
    remote.emit('disconnected')
  })// end - disconnect
} // end - start

module.exports = remote