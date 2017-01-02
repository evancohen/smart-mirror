function Greeting($scope, $http, $interval) {

    var greetingUpdater = function () {
        if (typeof config.general.greeting !== 'undefined' && !Array.isArray(config.general.greeting) && typeof config.general.greeting.midday !== 'undefined') {
            var hour = moment().hour();
            var greetingTime = "midday";

            if (hour > 4 && hour < 11) {
                greetingTime = "morning";
            } else if (hour > 18 && hour < 23) {
                greetingTime = "evening";
            } else if (hour >= 23 || hour < 4) {
                greetingTime = "night";
            }
            var nextIndex = Math.floor(Math.random() * config.general.greeting[greetingTime].length);
            var nextGreeting = config.general.greeting[greetingTime][nextIndex]
            $scope.greeting = nextGreeting;
        } else if (Array.isArray(config.general.greeting)) {
            $scope.greeting = config.general.greeting[Math.floor(Math.random() * config.general.greeting.length)];
        }
    };

    if (typeof config.general.greeting !== 'undefined') {
        greetingUpdater();
        $interval(greetingUpdater, config.calendar.refreshInterval * 60000 || 3600000)
    }
}

angular.module('SmartMirror')
    .controller('Greeting', Greeting);