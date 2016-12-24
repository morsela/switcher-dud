var express = require("express");
var alexa = require("alexa-app");
var bodyParser = require("body-parser");

var app = express();
var PORT = process.env.port || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

var alexaApp = new alexa.app("test");
alexaApp.launch(function(request, response) {
  response.say("You launched the app!");
});

alexaApp.dictionary = { "start_synonym": ["start", "enable"] };

alexaApp.intent("enableDud", {
    "slots": { },
    "utterances": [
      "{start_synonym} dud"
    ]
  },
  function(request, response) {
    response.say("Success!");
  }
);

alexaApp.express(app, "/echo/");

// launch /echo/test in your browser with a GET request

app.listen(PORT);
console.log("Listening on port " + PORT);