(function(annyang) {
  'use strict';

  function TodoService($http) {
    var service = {};

    service.tasks = [];

    service.renderTasks = function() {
      return $http.get('https://todoist.com/API/getUncompletedItems?project_id='+ config.todo.project+'&token='+ config.todo.key)
      .then(function(response) {
          return service.tasks = response;
      });
    }	
	
	service.addTask = function(spokenWords){
	  console.log("Taak toevoegen", spokenWords);
	  var spokenWordsCap = spokenWords.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
	  return $http.post('https://todoist.com/API/addItem?content=' + spokenWordsCap + '&project_id='+config.todo.project+'&priority=1&token=' + config.todo.key); 
    }  

  service.removeTask = function(spokenWords){ 
      if(service.tasks === null){
          return null;
      } 
      var spokenWordsCap = spokenWords.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      for (var i = 0; i < service.tasks.data.length; i++) {
        if (spokenWordsCap == service.tasks.data[i].content){
          var taskId = service.tasks.data[i].id;
        }
      } 
      return $http.post('https://todoist.com/API/deleteItems?ids=['+ taskId +']&token='+config.todo.key);
  }
	
    return service;
	
  }
  
  angular.module('SmartMirror')
    .factory('TodoService', TodoService);
}(window.annyang));