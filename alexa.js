var alexa  = require('alexa-app');
var util   = require('util')
var moment = require('moment');
var parseDuration = require('parse-duration')
require("moment-duration-format");

var Switcher = require('./switcher')
var mixpanel = require('./switcher_mixpanel');

module.exports = function() {
  var alexaApp = new alexa.app("SwitcherDud");

  alexaApp.dictionary = { "start_synonym": ["turn on", "start", "enable"], 
                          "stop_synonym":  ["turn off", "stop", "disable"] };

  alexaApp.error = console.error

  alexaApp.pre = function(request, response, type) {
    if (request.data.session.application.applicationId != process.env.ALEXA_APPLICATION_ID) {
        response.fail("Invalid Application");
    }

    if (request.data.session.user.accessToken == undefined) {
      mixpanel.track('link_account');

      response.linkAccount().say("please link the switcher dood account").send()
    }
  };

  alexaApp.launch(function(request, response) {
    response.say("Welcome to the unofficial switcher dood, to start your Switcher dood say start, to ask for status say status and to stop just say stop.");

    response.shouldEndSession(false);
  });

  alexaApp.intent('HelpIntent', {
      "slots": { },
      "utterances": [
        "help"
      ]
    }, function(req, res) {
      mixpanel.track('help');
      
      res.say("This skill can help you with intuitively controlling your Switcher Dood with your voice only. You can also exit the skill be saying cancel. What do you want the dood to do now?");
      res.shouldEndSession(false);

      return false;
    }
  );

  alexaApp.intent('Cancel', {
      "slots": { },
      "utterances": [
        "cancel"
      ]
    }, function(req, res) {
      mixpanel.track('cancel');
      
      res.shouldEndSession(true);

      return false;
    }
  );

  alexaApp.intent('GetDoodStatus', {
      "slots": { },
      "utterances": [
        "state", "status", "the status", "{ what\'s| what is| what|whats } the status"
      ]
    }, function(req, res) {
      mixpanel.track('get_status');

      Switcher.create(req.data.session.user.accessToken).then(switcher => {
        return switcher.getState();
      }).then(result => {
        var stringToSay = 'The dood status is unknown';

        if (result.state == 'on') {
          stringToSay = 'The dood is on for ' + result.duration_string;
        } else if (result.state == 'off') {
          stringToSay = 'The Dood is off';
        } 

        res.say(stringToSay).send();
      }).catch(function (err) {
        res.say("Cannot get dood state: " + err).send();
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
      mixpanel.track('enable');

      Switcher.create(req.data.session.user.accessToken).then(switcher => {
        return switcher.enable();
      }).then(result => {
          res.card({
            type: "Standard",
            title: "Switcher Dud is ON",
            text: "Switcher Dud has been turned on",
          }).say("Dood was turned on successfully!").send();
      }).catch(err => {
        res.say("cannot start dood").send();
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
      mixpanel.track('enable_with_duration');

      var duration_param = req.slot("Duration");
      duration_param     = duration_param.replace("PT", "");
      var duration_ms    = parseDuration(duration_param)

      duration_string = moment.duration(duration_ms, "ms").format("h [hours], m [minutes]");

      Switcher.create(req.data.session.user.accessToken).then(switcher => {
        return switcher.enableWithDuration(duration_ms);
      }).then(result => {
        res.say(util.format("Dood was turned on for %s successfully!", duration_string)).send();
      }).catch(err => {
        res.say(util.format("cannot start dood for %s because %s", duration_string, err)).send();
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
      mixpanel.track('disable');

      Switcher.create(req.data.session.user.accessToken).then(switcher => {
        return switcher.disable();
      }).then(result => {
        res.card({
          type: "Standard",
          title: "Switcher Dud is OFF",
          text: "Switcher Dud has been turned off",
        }).say("Dood was turned off successfully!").send();
      }).catch(err => {
        res.say("cannot turn off dood").send();
      })

      return false;
    }
  );

  return alexaApp;
}