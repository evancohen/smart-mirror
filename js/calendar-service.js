(function(annyang) {
    'use strict';

    function CalendarService($window, $http) {
      var service = {};

      service.renderAppointments = function() {
        ical_parser(PERSONAL_CALENDAR, function(data) {
          //console.log(data.getEvents());
          return data.getFutureEvents();
        });
      }

      return service;
    }

    angular.module('SmartMirror')
        .factory('CalendarService', CalendarService);
}(window.annyang));
