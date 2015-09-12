(function(angular) {
    'use strict';

    function MirrorCtrl(AnnyangService, $scope) {
        var _this = this;

        _this.init = function() {
            _this.clearResults();

            AnnyangService.addCommand('*allSpeech', function(allSpeech) {
                console.debug(allSpeech);
                _this.addResult(allSpeech);
            });
            
            AnnyangService.start();
        };
        
        _this.addResult = function(result) {
            _this.results.push({
                content: result,
                date: new Date()
            });
        };
        
        _this.clearResults = function() {
            _this.results = [];
        };

        _this.init();
    }

    angular.module('SmartMirror')
        .controller('MirrorCtrl', MirrorCtrl);

}(window.angular));