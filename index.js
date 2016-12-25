var express = require("express");
var alexa = require("alexa-app");
var bodyParser = require("body-parser");
var rp = require('request-promise');
var moment = require("moment");
var util = require('util')
var parseDuration = require('parse-duration')

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

alexaApp.dictionary = { "start_synonym": ["turn on", "start", "enable"], 
                        "stop_synonym":  ["turn off", "stop", "disable"] };

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
        var eventData = parsed_body["spontaneousEvent"]
        var duration  = eventData['endTime'] - eventData['startTime'] - eventData['currentDuration']
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
    var duration_param = req.slot("Duration");
    duration_param     = duration_param.replace("PT", "");
    var duration_ms    = parseDuration(duration_param)

    duration_string = moment.duration(duration_ms, "ms").format("h [hours], m [minutes], s [seconds]");

    rp(util.format(ENABLE_DURATION, TOKEN, SWITCH_ID, duration_ms)).then(function(body) {
      res.say(util.format("Dood was turned on for %s successfully!", duration_string)).send();
    }).catch(function (err) {
      console.log(err)

      res.say(util.format("cannot start dood for duration %s because %s", duration_string, err)).send();
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
    rp(util.format(DISABLE_CMD, TOKEN, SWITCH_ID)).then(function(body) {
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