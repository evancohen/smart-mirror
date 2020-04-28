function themeController($scope) {
	$scope.layoutName = (typeof config.layout !== 'undefined' && config.layout) ? config.layout : 'main';
}

angular.module('SmartMirror')
	.controller('Theme', themeController);