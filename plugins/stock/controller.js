function Stock($scope, $http, $q, $interval) {

	var Stocks= require('alphavantage')({ key: config.stock.key });
	// request info on each stock, 1 at a time
	var getStockQuotes = function () {
		var promises = [];
		angular.forEach(config.stock.names, function (symbol ) {
			promises.push(Stocks.data.quote(symbol))
		});    
		return $q.all(promises)
	}
  
	var getStocks = function () {
		getStockQuotes().then(function (result) {
			var stock = [];
			if (result instanceof Array) {
				stock = stock.concat(result);
			} else {
				stock.push(result);
			}
			$scope.stock = stock;
		}, function (error) {
			console.log(error);
		});
	}

	getStocks();

	// TODO: Add custom interval.
	//$interval(function name, delay in ms) --> [ms / 60,000 = min]
	//It appears that the "free" API key only provides up to 5 API calls per minute.

	//$interval(getStocks, 1800000); //Original 30min refresh interval.
	$interval(getStocks, 5 * 60000); //New 5min refresh interval.
	//$interval(getStocks, config.stock.refreshInterval * 60000)
	//EXAMPLE for config: $interval(refreshTrafficData, config.traffic.refreshInterval * 60000 || 900000)

}

angular.module('SmartMirror')
	.controller('Stock', Stock);