(function(annyang) {
    'use strict';

    function TrafficService() {
      var service = {};
      service.generateMap = function() {
        return "http://mapviewer.be-mobile.biz/#/map?@=51.153293543769834,4.369468688964844,11&map=BE_20140901_2&lang=nl_BE";
      }

      return service;
    }

    angular.module('SmartMirror')
        .factory('TrafficService', TrafficService);
}(window.annyang));
