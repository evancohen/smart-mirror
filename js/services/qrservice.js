(function (annyang) {
    'use strict';

    function QRService($http,$rootScope, $q) {
        var service = {};



/* place holder... currently i'm linking a image using googleapis chart api to generate a QR code... this needs to be changed
        <div class="qrImage-container animate-grow ng-scope" ng-if="focus == 'RemoteQR'">
        <img class="qrImage animate-grow" src="https://chart.googleapis.com/chart?cht=qr&amp;chs=400x400&amp;chl=http://10.20.10.142:8080">
<p>http://10.20.10.142:8080</p>
    </div>
*/

          service.getRemoteQR = function (){

              const interfaces = require('os').networkInterfaces()
              let addresses = []
              for (let k in interfaces) {
                for (let k2 in interfaces[k]) {
                  let address = interfaces[k][k2]
                  if (address.family === 'IPv4' && !address.internal) {
                    addresses.push(address.address)
                  }
                }
              }

            service.Remote_TXT = addresses[0] + ":" + config.remote.port;
            service.Remote_IMG = "https://chart.googleapis.com/chart?cht=qr&chs=400x400&chl=http://" + service.Remote_TXT;
            
          }

        return service;
    };    

    angular.module('SmartMirror')
        .factory('QRService', QRService);

} ());
