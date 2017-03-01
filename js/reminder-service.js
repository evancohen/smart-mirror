(function(annyang) {
    'use strict';

    function ReminderService($translate){
        // Service variable
        var service = {};
        // Flag to check if reminders list is empty
        service.empty = true;
        // Need to use the callback function because when the service is initialize,
        // the translation service is not set up.
        $translate('reminders.empty').then(function (translation) {
            service.reminders= [translation];
        });

        // Insert a new task in the reminder list.
    	service.insertReminder = function(remindMe){
    		if (service.empty){
                // If the list is empty, clear the reminders array because it contains the default empty task
                service.reminders = [];
                // Pass the flag to false
                service.empty = false;
            }
            // Push the new task to reminders list
            service.reminders.push(remindMe);
            console.debug(service.reminders);
            return service.reminders;
    	}

        // Clear the reminders list and set the empty flag to true
    	service.clearReminder = function(){
    		service.reminders = [$translate.instant('reminders.empty')];
    		service.empty = true;
    		return service.reminders;
    	}

        // Return the reminders list
    	service.getReminders = function(){
    		return service.reminders;
    	}

    	return service;
    }

	angular.module('SmartMirror')
	.factory('ReminderService', ReminderService);
}());