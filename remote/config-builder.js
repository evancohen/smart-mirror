$(function () {

  var socket = io()

  $connectionBar = $('#connection-bar')
  $connectionText = $('#connection-text')
  socket.on('connected', function () {
    $('#form').jsonForm({
        key: 'greatform',
        type: 'ace',
        aceMode: 'json',
        width: '100%',
        height: '' + (window.innerHeight - 140) + 'px',
        notitle: true,
        onChange: function () {
          generateForm();
        }
    })
    socket.emit('getJSON',true)
    $connectionBar.removeClass('disconnected').addClass('connected')
    $connectionText.html('Connected!')
  })

  socket.on('disconnect', function () {
    
    $connectionBar.removeClass('connected').addClass('disconnected')
    $connectionText.html('Disconnected :(')

  })

  socket.on('json', function(data){
    if (data.name == "form"){
      $('#result').jsonForm(data.json);
    } else if (data.name == "config"){
      $('#result').jsonForm(data.json);
    }
  })

  $('#reset').click(function () {
    socket.emit('getJSON',false)
  });

})