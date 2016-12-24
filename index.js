var express = require("express");
var alexa = require("alexa-app");
var bodyParser = require("body-parser");
var request = require('request');

var app = express();
var PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

const ENABLE_CMD = "http://server.switcher.co.il/Switcher/appServiceSetSwitchState?token=1455239767592&switchId=1429959227412&state=on"
const DISABLE_CMD = "http://server.switcher.co.il/Switcher/appServiceSetSwitchState?token=1455239767592&switchId=1429959227412&state=off"

var alexaApp = new alexa.app("test");
alexaApp.launch(function(request, response) {
  response.say("You launched the app!");
});

alexaApp.dictionary = { "start_synonym": ["turn on", "start", "enable"], "stop_synonym": ["turn off", "stop", "disable"] };

alexaApp.intent("EnableDud", {
    "slots": { },
    "utterances": [
      "{start_synonym} dud"
    ]
  },
  function(request, response) {
  	request(ENABLE_CMD, function (error, response, body) {
  		if (error || response.statusCode != 200) {
  			response.say("Dood was not turned on");
  		} else {
  			response.say("Dood was turned on successfully!");
  		}
	})
  }
);

alexaApp.intent("DisableDud", {
    "slots": { },
    "utterances": [
      "{stop_synonym} dud"
    ]
  },
  function(request, response) {
  	request(DISABLE_CMD, function (error, response, body) {
  		if (error || response.statusCode != 200) {
  			response.say("Dood was not turned off");
  		} else {
  			response.say("Dood was turned off successfully!");
  		}
	})
  }
);

alexaApp.express(app, "/echo/");

// launch /echo/test in your browser with a GET request

app.listen(PORT);
console.log("Listening on port " + PORT);