(function () {
	'use strict';
	function TodoistService($http, $httpParamSerializer, $q){
		var service = {};

		service.getItemsFromProject = function(project) {
			var deferred = $q.defer();
			service.requestProjectsWithItems().then(function (response) {
				console.log(response)
				deferred.resolve(service.getItemsOfProject(response, project));
			});
			return deferred.promise;
		}

		service.addTask = function(item, project) {
			var deferred = $q.defer();
			service.requestProjectsWithItems().then(function (response) {
				var project_id = service.getProjectId(project, response);
				var req = {
					method: 'POST',
					url: 'https://todoist.com/API/v7/sync',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					data: $httpParamSerializer({token: config.todoist.key, commands: '[{"type": "item_add", "temp_id": "", "uuid":"' + service.generateUUID() + '", "args": {"content": "' + item + '", "project_id": "' + project_id + '"}}]'})
				};
				$http(req).then(function() {
					deferred.resolve();
				});
			});
			return deferred.promise;
		}

		service.completeTask = function(item, project) {
			var deferred = $q.defer();
			service.requestProjectsWithItems().then(function (response) {
				var project_id = service.getProjectId(project, response);
				var item_ids = service.getItemIds(item, project_id, response);
				var req = {
					method: 'POST',
					url: 'https://todoist.com/API/v7/sync',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					data: $httpParamSerializer({token: config.todoist.key, commands: '[{"type": "item_complete", "uuid":"' + service.generateUUID() + '", "args": {"ids": [' + item_ids + ']}}]'})
				};
				$http(req).then(function() {
					deferred.resolve();
				});
			});
			return deferred.promise;
		}

		service.requestProjectsWithItems = function(){
			var deferred = $q.defer();
			var req = {
				method: 'POST',
				url: 'https://todoist.com/API/v7/sync',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: $httpParamSerializer({token: config.todoist.key, sync_token: '*', resource_types: '["projects", "items"]'})
			};
			$http(req).then(function(response) {
				deferred.resolve(response.data);
			});
			return deferred.promise;
		}

		// Get all items of thhe requested project.
		// return a array of items object
		service.getItemsOfProject = function(response, chosen_project){
			var result = [];
			var project_id = service.getProjectId(chosen_project, response);
			for (var i=0; i < response.items.length; i++){
				if (response.items[i].project_id === project_id){
					result.push(response.items[i]);
				}
			}
			return result;
		}

		// Get project id of the requested project.
		service.getProjectId = function(project, response){
			var project_id = -1;
			console.debug("Looking for " + project + " in the list " + response.projects);
			for (var i=0; i < response.projects.length; i++){
				if (response.projects[i].name.toLowerCase() === project.toLowerCase()){
					project_id = response.projects[i].id;
					console.debug("Found " + project + " : " + project_id);
					break;
				}
			}
			return project_id;
		}

		// Get a a list of item ids which matching the requested id for the requested project.
		// return a stringify list of item ids (ex : "134234","122343")
		service.getItemIds = function(item, project_id, response){
			var item_ids = "";
			console.debug("Looking for " + item + " in the list " + response.items);
			for (var i=0; i < response.items.length; i++){
				if (response.items[i].content.toLowerCase() === item.toLowerCase()
					&& response.items[i].project_id === project_id){
					item_ids = item_ids + '"' + response.items[i].id + '",';
				}
			}
			console.debug("Found " + item + " in list -> " + item_ids);
			return item_ids.substring(0, item_ids.length - 1);
		}

		// Generate UUID for the Todoist API
		service.generateUUID = function(){
			var d = new Date().getTime();
			if(window.performance && typeof window.performance.now === "function"){
				d += performance.now(); //use high-precision timer if available
			}
			var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = (d + Math.random()*16)%16 | 0;
				d = Math.floor(d/16);
				return (c=='x' ? r : (r&0x3|0x8)).toString(16);
			});
			return uuid;
		}

		return service;
	}

	angular.module('SmartMirror')
    .factory('TodoistService', TodoistService);
} ());
