function CommandsCtrl(
	Focus,
	SpeechService, $scope) {


	// List commands
	SpeechService.addCommand('list', function () {
		console.debug("Here is a list of commands...");
		console.log(SpeechService.commands);
		$scope.commands.commandPage = SpeechService.getCommands();
		$scope.commands.index = 0
		$scope.commands.totalPages = $scope.commands.commandPage.length
		Focus.change("commands");
	});

	// Next Page

	SpeechService.addCommand('list-next', function () {
		if (Focus.get()=='commands') {
			if ($scope.commands.index < $scope.commands.totalPages) {
				$scope.commands.index ++
			}
		}
	})

	// Prev Page
	SpeechService.addCommand('list-prev', function () {
		if (Focus.get()=='commands') {
			if ($scope.commands.index > 0) {
				$scope.commands.index --
			}
		}
	})
}

angular.module('SmartMirror')
	.controller('CommandsCtrl', CommandsCtrl);



