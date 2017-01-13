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
  $command = $('#command')
  $commandBox = $('#command-box')
  $commandBttn = $('#command-bttn')
  socket.on('connected', function () {
    $connectionBar.removeClass('disconnected').addClass('connected')
    $connectionText.html('Connected!')
    if (isIosDevice()){
      $speak.addClass('hidden')
      $command.removeClass('hidden')
    }else{
      $speak.removeClass('hidden')
      $command.addClass('hidden')
    }
  })

  socket.on('disconnect', function () {
    
    $connectionBar.removeClass('connected').addClass('disconnected')
    $connectionText.html('Disconnected :(')
  })

  if (annyang) {
    // Let's define our first command. First the text we expect, and then the function it should call
    var command = {
      '*command': function (command) {
        socket.emit('command', command)
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
    })
  } else {

  $('#command-bttn').click(function () {
    $('#speech-error').hide()
    var x = $commandBox.val();
    socket.emit('command', x)
  })
  }
  
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