function Customizer($scope, SpeechService) {

    if (config.customizer && config.customizer.commands.length >= 1) {
        angular.forEach(config.customizer.commands, function (command) {
            SpeechService.addRawCommand(command.utterance, function () {
                $scope.customizerHTML = command.body
                $scope.$parent.focus = "customizer"
            });
        });
    }
}

angular.module('SmartMirror')
    .controller('Customizer', Customizer);
