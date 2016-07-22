(function(annyang) {
  'use strict';

  function StockService($window, $http, $q) {
    var service = {};

    service.getStockQuotes = function() {
      var deferred = $q.defer();
      if (config.stock.names.length) {
        var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20in%20('+"'" + config.stock.names.join("','") + "'"+')&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json';

        $http.get(url).then(function(response) {
          deferred.resolve(response.data);
        }, function(error) {
          deferred.reject('Unknown error');
        });
      }

      return deferred.promise;
    }

    return service;
  }

  angular.module('SmartMirror')
    .factory('StockService', StockService);
}(window.annyang));
