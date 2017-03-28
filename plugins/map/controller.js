function Map($scope, $http, GeolocationService, SpeechService, Focus) {
	var map = {};
	map.center = "Seattle, WA"; //default map locaiton
	map.zoom = 13; //default zoom is 13

    // Get the current location of the mirror
	GeolocationService.getLocation({ enableHighAccuracy: true }).then(function (geoposition) {
		map.center = geoposition.coords.latitude + ',' + geoposition.coords.longitude;
	});

	var generateMap = function (targetCenter, targetZoom) {
		if (targetCenter === undefined) {
			targetCenter = map.center;
		} else {
            //when we change the center of the map keep track of it
			map.center = targetCenter;
		}
		if (targetZoom === undefined) {
			targetZoom = map.zoom;
		}
		return "https://maps.googleapis.com/maps/api/staticmap?center=" + targetCenter + "&zoom=" + targetZoom +
            "&format=png&sensor=false&scale=2&size=" + window.innerWidth +
            "x1200&maptype=roadmap&style=visibility:on|weight:1|invert_lightness:true|saturation:-100|lightness:1";
	};

    // Show map
	SpeechService.addCommand('map_show', function () {
		$scope.map = generateMap();
		Focus.change("map");
	});

    // Hide everything and "sleep"
	SpeechService.addCommand('map_location', function (location) {
		$scope.map = generateMap(location);
		Focus.change("map");
	});

    // Zoom in map
	SpeechService.addCommand('map_zoom_in', function () {
		map.zoom = map.zoom + 1;
		$scope.map = generateMap();
	});

	SpeechService.addCommand('map_zoom_out', function () {
		map.zoom = map.zoom - 1;
		$scope.map = generateMap();
	});

	SpeechService.addCommand('map_zoom_reset', function () {
		map.zoom = 13;
		$scope.map = generateMap();
	});

	SpeechService.addCommand('map_zoom_point', function (value) {
		if (0 + value < 0 || value == "zero") {
			value = 0
		} else if (0 + value > 18) {
			value = 18
		}
		map.zoom = value;
		$scope.map = generateMap();
	});

}

angular.module('SmartMirror')
    .controller('Map', Map);
