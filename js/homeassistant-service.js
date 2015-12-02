(function() {
    'use strict';

    function HomeAssistantService($http) {
      var service = {};

      //update the state of a switch
      service.switch = function(method, entity) {
        return HassRequest('switch' + method, {"entity_id": entity});
      }

      service.scene = function(method, entity) {
        return HassRequest('scene' + method, {"entity_id": entity});
      }

      // Create and return a HassRequest object ($http primise)
      var HassRequest = function(domain, method, data) {
        if(!method.match(/(turn_on|turn_off)/)){
          return null;
        }
        var request = {
            method: 'POST',
            url: HASS_BASE + 'services/' + domain + '/' + method,
            headers: {
                'x-ha-access': HASS_KEY,
                'content-type': 'application/json'
            },
            data: data
        }
        return $http(request);
      }

      return service;
    }

    angular.module('SmartMirror').factory('HomeAssistantService', HomeAssistantService);
}());
