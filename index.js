var express = require("express");
var alexa = require("alexa-app");
var bodyParser = require("body-parser");
var rp = require('request-promise');
var moment = require("moment");
var util = require('util')

require("moment-duration-format");

var app = express();
var PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

const BASE_URL        = "http://server.switcher.co.il/Switcher"
const ENABLE_CMD      = BASE_URL + "/appServiceSetSwitchState?token=%s&switchId=%s&state=on"
const DISABLE_CMD     = BASE_URL + "/appServiceSetSwitchState?token=%s&switchId=%s&state=off"
const ENABLE_DURATION = BASE_URL + "/setSpontaneousEvent?token=%s&switchId=%s&isManual=true&duration=%s"
const GET_STATE       = BASE_URL + "/appServiceGetSwitchState?token=%s&switchId=%s"

const TOKEN = "1455239767592"
const SWITCH_ID = "1429959227412"

var alexaApp = new alexa.app("SwitcherDud");
alexaApp.launch(function(request, response) {
  response.say("You launched the app!");
});

alexaApp.dictionary = { "start_synonym": ["turn on", "start", "enable"], "stop_synonym": ["turn off", "stop", "disable"] };

alexaApp.intent('GetDoodStatus', {
    "slots": { },
    "utterances": [
      "status"
    ]
  }, function(req, res) {
    rp(util.format(GET_STATE, TOKEN, SWITCH_ID)).then(function(body) {
      parsed_body = JSON.parse(body);
      state = parsed_body["state"];

      if (state == "on") {
        var duration = 60 * 60 * 1000 - parsed_body["spontaneousEvent"]["currentDuration"]
        console.log("The Dood is on")

        duration_string = moment.duration(duration, "ms").format("h [hours], m [minutes], s [seconds]");
        res.say('The Dood is on for ' + duration_string).send();;
      } else {
        console.log("The Dood is off")

        res.say("The Dood is off").send();;
      }
    }).catch(function (err) {
      console.log(err)

      res.say("Cannot get dood state: " + err).send();;
    });

    return false;
  }
);

alexaApp.intent("EnableDood", {
    "slots": { },
    "utterances": [
      "{start_synonym}"
    ]
  },
  function(req, res) {
    rp(util.format(ENABLE_CMD, TOKEN, SWITCH_ID)).then(function(body) {
      res.say("Dood was turned on successfully!").send();
    }).catch(function (err) {
      console.log(err)

      res.say("cannot start dood").send();;
    });

    return false;
  }
);

alexaApp.intent("EnableDoodWithDuration", {
    "slots": {
          "name": "Duration",
          "type": "AMAZON.DURATION"
        },
    "utterances": [
      "start for {Duration}"
    ]
  },
  function(req, res) {
    var duration = request.slot("Duration");
    console.log(duration);
    res.say("enable for " + duration);

    rp(util.format(ENABLE_DURATION, TOKEN, SWITCH_ID, duration)).then(function(body) {
      res.say(util.format("Dood was turned on for %s successfully!", duration)).send();
    }).catch(function (err) {
      console.log(err)

      res.say(util.format("cannot start dood for duration %s", duration)).send();
    });

    return false;
  }
);

alexaApp.intent("DisableDood", {
    "slots": { },
    "utterances": [
      "{stop_synonym}"
    ]
  },
  function(req, res)  {
    rp(util.format(ENABLE_CMD, TOKEN, SWITCH_ID)).then(function(body) {
      res.say("Dood was stopped successfully!").send();
    }).catch(function (err) {
      console.log(err)

      res.say("cannot stop dood").send();;
    });

    return false;
  }
);

alexaApp.express(app, "/echo/");

app.listen(PORT);
console.log("Listening on port " + PORT);