function _Commands($scope, $translate) {

	var list={}
	list['action']=$translate.instant("list.action")
	list['next']=$translate.instant("list.next")
	list['previous']=$translate.instant("list.previous")
	list['page']=$translate.instant("list.page")
	$scope.list=list;
}


angular.module('SmartMirror')
	.controller('commands', _Commands);