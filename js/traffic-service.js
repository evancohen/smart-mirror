(function(annyang) {
    'use strict';

    function TrafficService() {
      var service = {};
      service.generateMap = function(geoposition) {
        return "http://mapviewer.be-mobile.biz/#/map?@="+geoposition.coords.latitude+","+geoposition.coords.longitude+"&map=BE_20140901_2&lang=nl_BE";
      }

      return service;
    }

    angular.module('SmartMirror')
        .factory('TrafficService', TrafficService);
}(window.annyang));
