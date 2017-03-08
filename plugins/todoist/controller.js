function Todoist($scope, TodoistService, SpeechService, Focus) {

	// Show project
	SpeechService.addCommand('todoist_show', function (project) {
		console.debug("Show todoist project");
		getTodoist(project)
		Focus.change("todoist");
	});

	// Add element to project
	SpeechService.addCommand('todoist_add', function (element, project) {
		console.debug("Add element to todoist project");
		addItemTodoist(element, project);
		Focus.change("todoist");
	});

	// Remove element from project
	SpeechService.addCommand('todoist_remove', function (element, project) {
		console.debug("Remove element from todoist project");
		removeItemTodoist(element, project);
		Focus.change("todoist");
	});

	var getTodoist = function(project){
		TodoistService.getItemsFromProject(project).then(function (items) {
			$scope.todoist = items;
		}, function (error) {
			$scope.todoist = { error: error };
		});
	}

	var addItemTodoist = function(element, project){
		TodoistService.addTask(element, project).then(function () {
			getTodoist(project)
		}, function (error) {
			$scope.todoist = { error: error };
		});
	}

	var removeItemTodoist = function(element, project){
		TodoistService.completeTask(element, project).then(function () {
			getTodoist(project)
		}, function (error) {
			$scope.todoist = { error: error };
		});
	}
}

angular.module('SmartMirror')
    .controller('Todoist', Todoist);
