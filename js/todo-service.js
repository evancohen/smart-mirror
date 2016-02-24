(function(annyang) {
  'use strict';

  function TodoService($http) {
    var service = {};

    service.tasks = [];

    service.renderTasks = function() {
      return loadFile(config.todo.list);
      console.log("LOADFILE", loadFile);
    }

    var loadFile = function(url) {
      return $http({
          url: url,
          method: 'get'
        });
	};	
	
	service.addTask = function(spokenWords){
	  console.log("Taak toevoegen");
	  console.log("Spoken words", spokenWords);
	  var spokenWordsCap = spokenWords.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
	  return $http.post('https://todoist.com/API/addItem?content=' + spokenWordsCap + '&project_id='+config.todo.project+'&priority=1&token=' + config.todo.key); 
    }  
	
    return service;
	
  }
  
  angular.module('SmartMirror')
    .factory('TodoService', TodoService);
}(window.annyang));