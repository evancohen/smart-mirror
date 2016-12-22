function Xkcd($scope, $http, SpeechService) {

    // Show xkcd comic
    SpeechService.addCommand('image_comic', function (state, action) {
        $http.jsonp("http://dynamic.xkcd.com/api-0/jsonp/comic?callback=JSON_CALLBACK")
            .then(function (response) {
                $scope.xkcd = response.data.img;
                $scope.$parent.focus = "xkcd";
            });
    });

}

angular.module('SmartMirror')
    .controller('Xkcd', Xkcd);