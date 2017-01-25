function Stock($scope, $http, $q, $interval) {

	var getStockQuotes = function () {
		var deferred = $q.defer();

		if (!!config.stock && config.stock.names.length) {
			var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20in%20(' + "'" + config.stock.names.join("','") + "'" + ')&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json';

			$http.get(url).then(function (response) {
				deferred.resolve(response.data);
			}, function (error) {
				deferred.reject(error);
			});
		}

		return deferred.promise;
	}

	var getStocks = function () {
		getStockQuotes().then(function (result) {
			var stock = [];
			if (result.query.results.quote instanceof Array) {
				stock = stock.concat(result.query.results.quote);
			} else {
				stock.push(result.query.results.quote);
			}
			$scope.stock = stock;
		}, function (error) {
			console.log(error);
		});
	}

	getStocks();
    // TODO: Add custom interval.
    // 30 min refresh interval.
	$interval(getStocks, 1800000);
}

angular.module('SmartMirror')
    .controller('Stock', Stock);