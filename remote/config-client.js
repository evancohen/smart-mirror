$(function () {

  var socket = io()

  $connectionBar = $('#connection-bar')
  $connectionText = $('#connection-text')
  socket.on('connected', function () {
    socket.emit('getForm',true)
    $connectionBar.removeClass('disconnected').addClass('connected')
    $connectionText.html('Connected!')
  })

  socket.on('disconnect', function () {
    
    $connectionBar.removeClass('connected').addClass('disconnected')
    $connectionText.html('Disconnected :(')

  })

  socket.on('json', function(data){
      data.configJSON.value = $.extend({},data.configDefault,data.config)
      console.log(data);

    try {
      data.configJSON.onSubmitValid = function (values) {
        if (console && console.log) {
          console.log('Values extracted from submitted form', values);
          console.log(JSON.stringify(values, null, 2))
        }
        socket.emit('saveConfig', values)
      };
      data.configJSON.onSubmit = function (errors, values) {
        if (errors) {
          console.log('Validation errors', errors);
          return false;
        }
        return true;
      };
      console.log('items in data.configJSON',data.configJSON)
      $('#result').html('<form id="result-form" class="form-vertical"></form>');
      $('#result-form').jsonForm(data.configJSON);
    }
    catch (e) {
      $('#result').html('<pre>Entered content is not yet a valid' +
        ' JSON Form object.\n\nThe JSON Form library returned:\n' +
        e + '</pre>');
      return;
    }
  })

  $('#reset').click(function () {
    socket.emit('getJSON',false)
  });

})