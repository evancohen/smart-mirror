(function(annyang) {
    'use strict';

    angular.module('SmartMirror')
        .filter('DateFormatFilter', function($filter) {
          return function(input, format) {
            if (input !== undefined) {
              var year = input.substring(0, 4);
              var month = input.substring(5, 6);
              var day = input.substring(6, 8);
              var date = new Date(year, month - 1, day);
              return $filter('date')(date, format);
            }
            return "";
          };
        });
}(window.annyang));
