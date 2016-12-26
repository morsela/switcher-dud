var express = require("express");
var alexa = require("alexa-app");
var bodyParser = require("body-parser");
var rp = require('request-promise');
var moment = require("moment");
var util = require('util')
var parseDuration = require('parse-duration')

var path    = require("path");
var session = require('express-session')

require("moment-duration-format");

var app = express();
var PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

const BASE_URL        = "http://server.switcher.co.il/Switcher"
const LOGIN           = BASE_URL + "/loginApp"
const ENABLE_CMD      = BASE_URL + "/appServiceSetSwitchState?token=%s&switchId=%s&state=on"
const DISABLE_CMD     = BASE_URL + "/appServiceSetSwitchState?token=%s&switchId=%s&state=off"
const ENABLE_DURATION = BASE_URL + "/setSpontaneousEvent?token=%s&switchId=%s&isManual=true&duration=%s"
const GET_STATE       = BASE_URL + "/appServiceGetSwitchState?token=%s&switchId=%s"

const TOKEN     = process.env.SWITCHER_ACCOUNT_TOKEN
const SWITCH_ID = process.env.SWITCHER_SWITCH_ID

var alexaApp = new alexa.app("SwitcherDud");

alexaApp.dictionary = { "start_synonym": ["turn on", "start", "enable"], 
                        "stop_synonym":  ["turn off", "stop", "disable"] };

alexaApp.pre = function(request, response, type) {
  // console.log(request.user);

  // var session = request.getSession()

  console.log(request);
  console.log(session);
  console.log(request.session.user.accessToken)
  // console.log(session["user"]["accessToken"])
  // console.log(session["user"]["userId"])
  
  // if (request.applicationId != "amzn1.echo-sdk-ams.app.000000-d0ed-0000-ad00-000000d00ebe") {
  //   // fail ungracefully
  //   response.fail("Invalid applicationId");
  // }
};

alexaApp.intent('GetDoodStatus', {
    "slots": { },
    "utterances": [
      "state", "status", "the status", "{ what\'s| what is| what|whats } the status"
    ]
  }, function(req, res) {
    rp({ uri: util.format(GET_STATE, TOKEN, SWITCH_ID), json: true}).then(function(body) {
      state = body["state"];

      if (state == "on") {
        var eventData = parsed_body["spontaneousEvent"]
        var duration  = eventData['endTime'] - eventData['startTime'] - eventData['currentDuration']
        console.log("The Dood is on")

        duration_string = moment.duration(duration, "ms").format("h [hours], m [minutes], s [seconds]");
        res.say('The Dood is on for ' + duration_string).send();;
      } else if (state == "off") {
        console.log("The Dood is off")

        res.say("The Dood is off").send();;
      } else {
        console.log("The Dood status is unknown")

        res.say("The Dood status is unknown").send();;
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
      res.card({
        type: "Standard",
        title: "Switcher Dud is ON",
        text: "Switcher Dud has been turned on",
        image: {
          smallImageUrl: "https://apkplz.com/storage/images/com/codewithcontent/switcher/android/300/switcher-dud.png",
          largeImageUrl: "https://apkplz.com/storage/images/com/codewithcontent/switcher/android/300/switcher-dud.png"
        }
      }).say("Dood was turned on successfully!").send();

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
      res.card({
        type: "Standard",
        title: "Switcher Dud is OFF",
        text: "Switcher Dud has been turned off",
        image: {
          smallImageUrl: "https://apkplz.com/storage/images/com/codewithcontent/switcher/android/300/switcher-dud.png",
          largeImageUrl: "https://apkplz.com/storage/images/com/codewithcontent/switcher/android/300/switcher-dud.png"
        }
      }).say("Dood was turned off successfully!").send();
    }).catch(function (err) {
      console.log(err)

      res.say("cannot turn off dood").send();
    });

    return false;
  }
);

alexaApp.express(app, "/echo/");

app.use(session({
  secret: '944e6073-98b4-4ffc-b486-f83c0bde0e40',
  saveUninitialized: true,
  resave: false
}))

app.get('/echo/SwitcherDud/login/', function(req, res) {
  req.session.state       = req.query['state']
  req.session.clientId    = req.query['client_id']
  req.session.redirectURI = req.query['redirect_uri']

  res.render(path.join(__dirname+'/views/login.ejs'));  
});

app.post('/echo/SwitcherDud/login/', function(req, res) {
  var username = req.body['username']
  var password = req.body['password']

  var body = {
    account_pid: username,
    password: password,
    app_id: "",
    device_info: {
      versions: {
        os: "",
        software: ""
      }
    }
  }

  rp({ method: 'POST', uri: LOGIN, json: true, body: body }).then(function(body) {
    if (body['errorCode'] != 0) {
      res.send("Failed to login")
    } else {
      var access_token = body['token']

      if (req.session.redirectURI != undefined) {
        res.redirect(util.format('%s&state=%s&access_token=%s&token_type=Bearer', req.session.redirectURI, req.session.state, access_token))  
      } else {
        res.send("Login success")
      }
    }    
  }).catch(function (err) {
      console.log(err)

      res.say("login failed").send();
  });
});

app.listen(PORT);
console.log("Listening on port " + PORT);