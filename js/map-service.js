(function(annyang) {
    'use strict';

    function MapService() {
        var service = {};
        service.center = "Seattle, WA"; //default map locaiton
        service.zoom = 13; //default zoom is 13
        // COMMANDS
        service.commands = {};

        service.generateMap = function(targetCenter, targetZoom) {
            if (targetCenter === undefined) {
                targetCenter = service.center;
            } else{
                //when we change the center of the map keep track of it
                service.center = targetCenter;
            }
            if (targetZoom === undefined) {
                targetZoom = service.zoom;
            }
            return "https://maps.googleapis.com/maps/api/staticmap?center="+targetCenter+"&zoom="+targetZoom+
            "&format=png&sensor=false&scale=2&size="+window.innerWidth+
            "x1200&maptype=roadmap&style=visibility:on|weight:1|invert_lightness:true|saturation:-100|lightness:1";
        };

        service.zoomIn = function() {
            service.zoom = service.zoom + 1;
            return service.generateMap(service.center);
        };

        service.zoomTo = function(value) {
            if(0 + value < 0 || value == "zero"){
              value = 0
            } else if(0 + value > 18){
              value = 18
            }
            service.zoom = value;
            return service.generateMap(service.center);
        };

        service.zoomOut = function() {
            service.zoom = service.zoom - 1;
            return service.generateMap(service.center);
        };

        service.reset = function() {
            service.zoom = 13;
            return service.generateMap(service.center);
        };

        return service;
    }

    angular.module('SmartMirror')
        .factory('MapService', MapService);

}(window.annyang));
