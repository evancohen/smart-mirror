$(function () {

  var socket = io()

  if (annyang) {
    // Let's define our first command. First the text we expect, and then the function it should call
    var command = {
      '*command': function (command) {
        socket.emit('command', command)
      }
    }

    // Add our commands to annyang
    annyang.addCommands(command)

    // Start listening. You can call this here, or attach this call to an event, button, etc.
    $('#speak').click(function () {
      console.log('listening...')
      annyang.start({ autoRestart: false, continuous: false })
    })
  }

  $('#open-devtools').change(function () {
    socket.emit('devtools', $(this).is(":checked"))
  });

  $('#kiosk-modde').change(function () {
    socket.emit('kiosk', $(this).is(":checked"))
  });

  $('#reload').click(function () {
    socket.emit('reload')
  })

  socket.on('login', function (data) {
    connected = true
    // Display the welcome message
    var message = "Welcome to Socket.IO Chat – "
    log(message, {
      prepend: true
    })
    addParticipantsMessage(data)
  })

})