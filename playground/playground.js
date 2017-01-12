/*global $, ace, console*/

$('document').ready(function () {
  var cdn = {example:"speech/config.schema",branch:"master",repo:"evancohen"}
    cdn.url = function(){
    	if (this.example && this.branch && this.repo){
        this.refresh()
        return 'https://gitcdn.xyz/repo/' + this.repo + '/smart-mirror/' + this.branch + "/plugins/" + this.example + '.json'
      } else {
        this.refresh()
        return 'https://gitcdn.xyz/repo/evancohen/smart-mirror/master/plugins/speech/config.schema.json'
      }
    }
    cdn.refresh = function(a,b){
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    var param = null;
    for (var i = 0; i < vars.length; i++) {
      param = vars[i].split('=');
          this[param[0]] = param[1]
    }
    if (a && b){this[a]=b}
    if (history) {
    history.pushState(
      {example:this.example},
      "Example - " + this.example,
      `?example=` + this.example + '&repo='+this.repo+'&branch='+this.branch)
    }

    }
  var formObject = {
    schema: {
      repo: {
       title: 'Repo',
       type: 'string',
       enum: [
           'evancohen',
           'other'
       ]
      },
      repoOther: {
       title: 'Other Repo',
       type: 'string'
      },
      branch: {
       title: 'Branch',
       type: 'string',
       enum: [
           "master",
           "dev",
           "other"
       ]
      },
      branchOther: {
       title: 'branch',
       type: 'string'
      },
      example: {
        title: 'JSON Form example to start from',
        type: 'string',
        'enum': [
			"autosleep/config.schema",
			"calendar/config.schema",
			"geolocation/config.schema",
			"giphy/config.schema",
			"greeting/config.schema",
			"light/config.schema",
			"maker/config.schema",
			"remote/config.schema",
			"rss/config.schema",
			"scrobbler/config.schema",
			"search/config.schema",
			"soundcloud/config.schema",
			"speech/config.schema",
			"stock/config.schema",
			"traffic/config.schema",
			"tvshows/config.schema",
			"weather/config.schema",
			"_general/config.schema"
		],
        'default': 'speech/config.schema'
      },
      greatform: {
        title: 'JSON Form object to render',
        type: 'string'
      }
    },
    form: [
      {
        key: 'repo',
        type: 'selectfieldset',
        titleMap: {
            "evancohen":"evancohen",
            "other":"other"
        },
        items: [
            {
              type:"section",
              items: [
                    {
                      key:"repoOther",
                      type:"hidden"
                    }
                  ]
            },
            {
              type:"section",
              items:[
                {
                  key:"repoOther",
                  htmlClass: "next-to",
                  onChange: function (evt) {
                    var selected = $(evt.target).val();
                    cdn.refresh("repo",selected)
                    loadExample();
                  }
                }
              ]
            }
          ],
          onChange: function (evt) {
              var selected = $(evt.target).val();
              if (selected != "other"){
                cdn.refresh("repo",selected)
                loadExample();
              }
          }
      },
      {
        key: "branch",
        type: 'selectfieldset',
        titleMap: {
            "master":"master",
            "dev": "dev",
            "other":"other"
        },
        items: [
            {
              type:"section",
              items: [
                    {
                      key:"branchOther",
                      type:"hidden"
                    }
                  ]
            },
            {
              type:"section",
              items: [
                    {
                      key:"branchOther",
                      type:"hidden"
                    }
                  ]
            },
            {
              type:"section",
              items:[
                {
                  key:"branchOther",
                  onChange: function (evt) {
                      var selected = $(evt.target).val();
                      cdn.refresh("branch",selected)
                      loadExample();
                  }
                },
              ]
            }
          ],
          onChange: function (evt) {
              var selected = $(evt.target).val();
              if (selected != "other"){
                cdn.refresh("branch",selected)
                loadExample();
              }
          }
      },
      {
        key: 'example',
        notitle: true,
        prepend: 'Try with',
        htmlClass: 'trywith',
        titleMap: {
          "autosleep/config.schema":"AutoSleep Form Section Example",
          "calendar/config.schema":"Calendar Form Section Example",
          "geolocation/config.schema":"GeoLocation Form Section Example",
          "giphy/config.schema":"Giphy Form Section Example",
          "greeting/config.schema":"Greeting Form Section Example",
          "light/config.schema":"Light Form Section Example",
          "maker/config.schema":"Maker Form Section Example",
          "remote/config.schema":"Remote Form Section Example",
          "rss/config.schema":"RSS Form Section Example",
          "scrobbler/config.schema":"Scrobbler Form Section Example",
          "search/config.schema":"Search Form Section Example",
          "soundcloud/config.schema":"SoundCloud Form Section Example",
          "speech/config.schema":"Speech Form Section Example",
          "stock/config.schema":"Stock Form Section Example",
          "traffic/config.schema":"Traffic Form Section Example",
          "tvshows/config.schema":"TV Shows Form Section Example",
          "weather/config.schema":"weather Form Section Example",
          "_general/config.schema":"General Form Section Example"
        },
        onChange: function (evt) {
          var selected = $(evt.target).val();
          cdn.refresh("example",selected)
          loadExample();
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
          cdn[param[0]] = param[1]
    }
    return cdn.url();
  };


  /**
   * Loads and displays the example identified by the given name
   */
  var loadExample = function () {
    $.ajax({
      url: getRequestedExample(),
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
    var example = getRequestedExample();
    $('.trywith select').val(example);
    if (window.ace) {
      window.clearInterval(itv);
      loadExample();
    }
  }, 1000);
});