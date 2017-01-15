/* global $, io */

$(function () {

  var socket = io()

  var $connectionBar = $('#connection-bar')
  var $connectionText = $('#connection-text')
  socket.on('connected', function () {
    $connectionBar.removeClass('disconnected').addClass('connected')
    $connectionText.html('Connected!')
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