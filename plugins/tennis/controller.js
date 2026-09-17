function Tennis($scope, TennisService) {
	var settings = config.tennis || {};
	$scope.tennis = TennisService.state;
	$scope.tennisLimit = Math.max(1, Math.min(10, Math.floor(Number(settings.maxMatches) || 3)));
	$scope.$on('$destroy', TennisService.start());
}

angular.module('SmartMirror').controller('Tennis', Tennis);
