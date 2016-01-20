(function(annyang) {
    'use strict';

    function CalendarService($window, $http) {
      var service = {};

      service.renderAppointments = function() {
        var events = {};
        ical_parser(PERSONAL_CALENDAR, function(data) {
          events = data.getFutureEvents();
          console.log(events);
        });
        console.log(events);
        return events;
      }

      return service;
    }

    angular.module('SmartMirror')
        .factory('CalendarService', CalendarService);
}(window.annyang));
