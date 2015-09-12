"use strict";


var smartMirror = angular.module('smartMirror', []);

smartMirror.controller("smartMirrorCtrl", function($scope) {
  $scope.someting = "Hello World";
});

// first we make sure annyang started succesfully
if (annyang) {

  var help = function(){
    console.log("Here to help!");
  }
  // define the functions our commands will run.
  var hello = function() {
    alert("hello");
  };

  // define our commands.
  // * The key is the phrase you want your users to say.
  // * The value is the action to do.
  //   You can pass a function, a function name (as a string), or write your function as part of the commands object.
  var commands = {
    '(show me) help':       help,
    'hello (there)':        hello,
    'stop listening':       stopListening,
  };

  var commandsAlways = {
    'start listening': startListening,
  }

  // OPTIONAL: activate debug mode for detailed logging in the console
  annyang.debug();

  // Add voice commands to respond to
  annyang.addCommands(commands);
  annyang.addCommands(commandsAlways);

  // Start listening. You can call this here, or attach this call to an event, button, etc.
  annyang.start();

  //Let us know when we are ready to go
  annyang.addCallback('start', function(){
    console.log("Ready to listen...");
  })

  annyang.addCallback('resultNoMatch', function(userSaid){
    console.log("Could not recognize phrase \"" + userSaid + "\"")
  })


  //Being smart about listening
  var stopListening = function() {
    console.log("removing commands...");
    annyang.removeCommands(commands)
  };

  var startListening = function() {
    console.log("adding commands...");
    annyang.addCommands(commands);
  };

} else {
  alert('unsupported');
}