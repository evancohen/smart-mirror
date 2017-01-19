function Reminder($scope, SpeechService, $translate, Focus) {
	const storage = require('electron-json-storage');
    // Service variable
	var remind = {};
    // Flag to check if reminders list is empty
	storage.empty = true;
    // Need to use the callback function because when the service is initialize,
    // the translation service is not set up.
	$translate('reminders.empty').then(function (translation) {
		remind.reminders = [translation];
	});
    // Check if reminder storage already exists
	storage.has('sm-reminder', function (error, hasKey) {
		if (error) throw error;
		if (hasKey) {
            // Flag to check if reminders list is empty
			remind.empty = false;
			storage.get('sm-reminder', function (error, data) {
				if (error) throw error;
				remind.reminders = data.reminders;
			});
		}
	});

    // Insert a new task in the reminder list.
	remind.insertReminder = function (remindMe) {
		if (remind.empty) {
            // If the list is empty, clear the reminders array because it contains the default empty task
			remind.reminders = [];
            // Pass the flag to false
			remind.empty = false;
		}
        // Push the new task to reminders list
		remind.reminders.push(remindMe);
		storage.set('sm-reminder', { reminders: remind.reminders }, function (error) {
			if (error) throw error;
		});
		return remind.reminders;
	}

    // Clear the reminders list and set the empty flag to true
	remind.clearReminder = function () {
		remind.reminders = [$translate.instant('reminders.empty')];
		remind.empty = true;
		storage.remove('sm-reminder', function (error) {
			if (error) throw error;
		});
		return remind.reminders;
	}

    // Return the reminders list
	remind.getReminders = function () {
		return remind.reminders;
	}

    // Set a reminder
	SpeechService.addCommand('reminder_insert', function (task) {
		$scope.reminders = remind.insertReminder(task);
		Focus.change("reminders");
	});

    // Clear reminders
	SpeechService.addCommand('reminder_clear', function () {
		$scope.reminders = remind.clearReminder();
		Focus.change("default");
	});

    // Clear reminders
	SpeechService.addCommand('reminder_show', function () {
		$scope.reminders = remind.getReminders();
		Focus.change("reminders");
	});
}

angular.module('SmartMirror')
    .controller('Reminder', Reminder);

