// Warn the user if they have not filled out config.js or if it has an error
if(typeof config == 'undefined'){
    alert("'config.js' is missing or contains an error!");
}



// Bootstrap Angular
(function(angular) {
    'use strict';
    
   
   
    angular.module('SmartMirror', ['ngAnimate', 'tmh.dynamicLocale', 'pascalprecht.translate'])
        .config(function(tmhDynamicLocaleProvider,$compileProvider) {
        		
        		
        		var locale = config.language.toLowerCase();
            tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_' + locale + '.js');
                  
					 //camel cased directive name
					 //in your HTML, this will be named as bars-chart
					 $compileProvider.directive('barsChart', function ($parse) {
					 
				
						 //explicitly creating a directive definition variable
						 //this may look verbose but is good for clarification purposes
						 //in real life you'd want to simply return the object {...}
						 var directiveDefinitionObject = {
								 //We restrict its use to an element
								 //as usually  <bars-chart> is semantically
								 //more understandable
								 restrict: 'E',
								 //this is important,
								 //we don't want to overwrite our directive declaration
								 //in the HTML mark-up
								 replace: false,
								 link: function (scope, element, attrs) {
								   //converting all data passed thru into an array
								   var data = attrs.chartData.split(',');
								   
								   
								   //in D3, any selection[0] contains the group
								   //selection[0][0] is the DOM node
								   //but we won't need that this time
								   var chart = d3.select(element[0]);
								   
								
								   //to our original directive markup bars-chart
								   //we add a div with out chart stling and bind each
								   //data entry to the chart
								    chart.append("div").attr("class", "chart")
								     .selectAll('div')
								     .data(data).enter().append("div")
								     .transition().ease("elastic")
								     .style("width", function(d) { return d + "%"; })
								     .text(function(d) { return d + "%"; });
								   //a little of magic: setting it's width based
								   //on the data value (d) 
								   //and text all with a smooth transition
								 } 
							};
						 return directiveDefinitionObject;
					 });
					 
        })
        
        .config(['$translateProvider', function ($translateProvider) {
            $translateProvider
                .uniformLanguageTag('bcp47')
                .useStaticFilesLoader({
                    prefix: 'locales/',
                    suffix: '.json'
                });
            $translateProvider.useSanitizeValueStrategy(null);
            // Avoiding the duplicity of the locale for the default language, xx-YY -> xx
            // We are considering only the language
            // Please refer https://github.com/evancohen/smart-mirror/pull/179 for further discussion
            var language = config.language.substring(0, 2);
            $translateProvider.preferredLanguage(language);
        }])
        
        .config(["$sceDelegateProvider", function($sceDelegateProvider) {
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                "http://www.youtube.com/embed/**"
            ]);
        }])
        
      
					
		
   //angular.bootstrap(document.getElementById("App2"), ['myApp']);  
        
        
        
        

}(window.angular));
