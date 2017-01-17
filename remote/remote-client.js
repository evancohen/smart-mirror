/* global $, io */

$(function () {


  var socket = io()
  function isIosDevice(){
  var iosDeviceList = [
    "iPhone", "iPod", "iPad", "iPhone Simulator", "iPod Simulator",
    "iPad Simulator", "Pike v7.6 release 92", "Pike v7.8 release 517"
  ]
  return iosDeviceList.some(function(device){
    return device == navigator.platform
    })
  }

  $connectionBar = $('#connection-bar')
  $connectionText = $('#connection-text')
  $speak = $('#speak')
  $nospeak = $('#no-speak')
  $commandBox = $('#command-box')
  $commandBttn = $('#command-bttn')
  
  socket.on('connected', function () {
    $connectionBar.removeClass('disconnected').addClass('connected')
    $connectionText.html('Connected!')
    if (isIosDevice()){
      $speak.addClass('hidden')
      $no-speak.removeClass('hidden')
    } 
    if (annyang) {
      socket.emit('getAnnyAng')
    }  
  })

  socket.on('disconnect', function () {
    
    $connectionBar.removeClass('connected').addClass('disconnected')
    $connectionText.html('Disconnected :(')
  })

  socket.on('loadAnnyAng', function(data){
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

    annyang.addCallback('error', function(error){
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

  


})