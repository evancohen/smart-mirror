(function () {
	'use strict';
	function TodoistService($http, $httpParamSerializer, $q){
		var service = {};

		service.renderTasks = function(project) {
			var deferred = $q.defer();
			var req = {
				method: 'POST',
				url: 'https://todoist.com/API/v7/sync',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: $httpParamSerializer({token: config.todoist.key, sync_token: '*', resource_types: '["items", "projects"]'})
			};
			$http(req).then(function(response) {
		    	deferred.resolve(service.getItemsOfProject(response.data, project));
			});
			return deferred.promise;
		}

		service.addTask = function(element, project) {
			var deferred = $q.defer();
			service.requestProjects().then(function (projects) {
				console.log(projects);
				var project_id = service.getProjectId(project, projects);
				console.log(project_id)
				var req = {
					method: 'POST',
					url: 'https://todoist.com/API/v7/sync',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					data: $httpParamSerializer({token: config.todoist.key, commands: '[{"type": "item_add", "temp_id": "", "uuid":"' + service.generateUUID() + '", "args": {"content": "' + element + '", "project_id": "' + project_id + '"}}]'})
				};
				$http(req).then(function() {
			    	deferred.resolve();
				});
			});
			return deferred.promise;
		}

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

		service.getProjectId = function(project, response){
			var project_id = -1;
			for (var i=0; i < response.projects.length; i++){
				if (response.projects[i].name.toLowerCase() === project.toLowerCase()){
					project_id = response.projects[i].id;
					break;
				}
			}
			return project_id;
		}

		service.requestProjects = function(){
			var deferred = $q.defer();
			var response = [];
			var req = {
				method: 'POST',
				url: 'https://todoist.com/API/v7/sync',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: $httpParamSerializer({token: config.todoist.key, sync_token: '*', resource_types: '["projects"]'})
			};
			$http(req).then(function(response) {
				deferred.resolve(response.data);
			});
			return deferred.promise;
		}

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
