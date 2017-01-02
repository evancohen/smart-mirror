/*global $, ace, console*/
$('document').ready(function () {
  var formObject = {
    schema: {
      example: {
        title: 'JSON Form example to start from',
        type: 'string',
        'enum': [
			"plugins_autosleep_config.schema",
			"plugins_calendar_config.schema",
			"plugins_geolocation_config.schema",
			"plugins_giphy_config.schema",
			"plugins_greeting_config.schema",
			"plugins_light_config.schema",
			"plugins_maker_config.schema",
			"plugins_remote_config.schema",
			"plugins_rss_config.schema",
			"plugins_scrobbler_config.schema",
			"plugins_search_config.schema",
			"plugins_soundcloud_config.schema",
			"plugins_speech_config.schema",
			"plugins_stock_config.schema",
			"plugins_traffic_config.schema",
			"plugins_tvshows_config.schema",
			"plugins_weather_config.schema",
			"plugins__general_config.schema"
		],
        'default': 'plugins_speech_config.schema'
      },
      greatform: {
        title: 'JSON Form object to render',
        type: 'string'
      }
    },
    form: [
      {
        key: 'example',
        notitle: true,
        prepend: 'Try with',
        htmlClass: 'trywith',
        titleMap: {
			"plugins_autosleep_config.schema":"AutoSleep Form Section Example",
			"plugins_calendar_config.schema":"Calendar Form Section Example",
			"plugins_geolocation_config.schema":"GeoLocation Form Section Example",
			"plugins_giphy_config.schema":"Giphy Form Section Example",
			"plugins_greeting_config.schema":"Greeting Form Section Example",
			"plugins_light_config.schema":"Light Form Section Example",
			"plugins_maker_config.schema":"Maker Form Section Example",
			"plugins_remote_config.schema":"Remote Form Section Example",
			"plugins_rss_config.schema":"RSS Form Section Example",
			"plugins_scrobbler_config.schema":"Scrobbler Form Section Example",
			"plugins_search_config.schema":"Search Form Section Example",
			"plugins_soundcloud_config.schema":"SoundCloud Form Section Example",
			"plugins_speech_config.schema":"Speech Form Section Example",
			"plugins_stock_config.schema":"Stock Form Section Example",
			"plugins_traffic_config.schema":"Traffic Form Section Example",
			"plugins_tvshows_config.schema":"TV Shows Form Section Example",
			"plugins_weather_config.schema":"weather Form Section Example",
			"plugins__general_config.schema":"General Form Section Example"
		},
        onChange: function (evt) {
          var selected = $(evt.target).val();

          loadExample(selected);
          if (history) history.pushState(
            { example: selected},
            'Example - ' + selected,
            '?example=' + selected);
        }
      },
      {
        key: 'greatform',
        type: 'ace',
        aceMode: 'json',
        width: '100%',
        height: '' + (window.innerHeight - 140) + 'px',
        notitle: true,
        onChange: function () {
          generateForm();
        }
      },
      {
          "type":"button",
          "title": "Save config.schema.json"
    }
    ],
        "onSubmitValid": function (values) {
          var hiddenElement = document.createElement('a');
          var schemaJson = values.greatform
          var defaultJson = schemaJson.value
          delete schemaJson.value
          downloadFile(schemaJson,"config.schema.json")
          downloadFile(defaultJson,"config.default.json")
          function downloadFile(fileContent, fileName){
          hiddenElement.href = 'data:attachment/text,' + encodeURI(fileContent);
          hiddenElement.target = '_blank';
          hiddenElement.download = fileName;
          hiddenElement.click();
          }
      },
        "onSubmit": function (errors, values) {
          if (errors) {
            console.log('Validation errors', errors);
            return false;
          }
          return true;
      }
    
  };


  /**
   * Extracts a potential form to load from query string
   */
  var getRequestedExample = function () {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    var param = null;
    for (var i = 0; i < vars.length; i++) {
      param = vars[i].split('=');
      if (param[0] === 'example') {
        return param[1];
      }
    }
    return null;
  };

  /**
   * Loads and displays the example identified by the given name
   */
  var loadExample = function (example) {
    $.ajax({
      url: 'examples/' + example + '.json',
      dataType: 'text'
    }).done(function (code) {
      var aceId = $('#form .ace_editor').attr('id');
      var editor = ace.edit(aceId);
      editor.getSession().setValue(code);
    }).fail(function () {
      $('#result').html('Sorry, I could not retrieve the example!');
    });
  };


  /**
   * Displays the form entered by the user
   * (this function runs whenever once per second whenever the user
   * changes the contents of the ACE input field)
   */
  var generateForm = function () {
    var values = $('#form').jsonFormValue();

    // Reset result pane
    $('#result').html('');

    // Parse entered content as JavaScript
    // (mostly JSON but functions are possible)
    var createdForm = null;
    try {
      // Most examples should be written in pure JSON,
      // but playground is helpful to check behaviors too!
      eval('createdForm=' + values.greatform);
    }
    catch (e) {
      $('#result').html('<pre>Entered content is not yet a valid' +
        ' JSON Form object.\n\nJavaScript parser returned:\n' +
        e + '</pre>');
      return;
    }

    // Render the resulting form, binding to onSubmitValid
    try {
      createdForm.onSubmitValid = function (values) {
        if (console && console.log) {
          console.log('Values extracted from submitted form', values);
          console.log(JSON.stringify(values, null, 2))
      }
        window.alert('Form submitted. Values object:\n' +
          JSON.stringify(values, null, 2));
      };
      createdForm.onSubmit = function (errors, values) {
        if (errors) {
          console.log('Validation errors', errors);
          return false;
        }
        return true;
      };
      createdForm.form.push({"type":"button","title":"Submit"})
      console.log('items in createdForm',createdForm)
      $('#result').html('<form id="result-form" class="form-vertical"></form>');
      $('#result-form').jsonForm(createdForm);
    }
    catch (e) {
      $('#result').html('<pre>Entered content is not yet a valid' +
        ' JSON Form object.\n\nThe JSON Form library returned:\n' +
        e + '</pre>');
      return;
    }
  };

  // Render the form
  $('#form').jsonForm(formObject);

  // Wait until ACE is loaded
  var itv = window.setInterval(function() {
    var example = getRequestedExample() || 'plugins_speech_config.schema';
    $('.trywith select').val(example);
    if (window.ace) {
      window.clearInterval(itv);
      loadExample(example);
    }
  }, 1000);
});