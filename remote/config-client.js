/* global $, io */

$(function () {

  var socket = io()

  var $connectionBar = $('#connection-bar')
  var $connectionText = $('#connection-text')
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
      data.configJSON.form.push({"type":"button","title":"Submit","order":10000})
      console.log(data);

    try {
      data.configJSON.onSubmitValid = function (values) {
        if (console && console.log) {
          console.log('Values extracted from submitted form', values);
          console.log(JSON.stringify(values, null, 2))

        }
        socket.emit('saveConfig', values)
        $('#outMsg').html("<p><strong>Your Configuration has saved.</strong></p>")
        showElm('#out',1)
      };
      data.configJSON.onSubmit = function (errors) {
        if (errors) {
          console.log('Validation errors', errors);
          let buildInner=""
          errors.forEach(function(errItem) {
            let errSchemaUri = errItem.schemaUri.replace(/.+\/properties\//, "").replace("/"," >> ")  
            buildInner += `<p><strong style="font-color:red">Error: ` + errItem.message + 
            "</strong></br>Location: " +
            errSchemaUri +
            "</p>"
          })
          $('#outMsg').html(buildInner)
          showElm('#out',1)
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
        e.stack + '</pre>');
        console.error("error stack",e.stack)
      return;
    }
  })

var timeoutID
  
  function hideElm(element){
    $(element).fadeOut("fast")
  }
  function showElm(element,timeOutMins=1){
    var timeOutMillis = timeOutMins*60000
    $(element).fadeIn() 
    timeoutID=setTimeout(function(){
      hideElm(element);
      },timeOutMillis)
  }
  
  $('#outClose').click(function () {
    clearTimeout(timeoutID)
    hideElm('#out')
  });

})