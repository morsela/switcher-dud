var alexa  = require('alexa-app');
var util   = require('util')
var moment = require('moment');
var parseDuration = require('parse-duration')
require("moment-duration-format");

var Switcher = require('./switcher')

module.exports = function(app) {
  var alexaApp = new alexa.app("SwitcherDud");
  alexaApp.express(app, "/echo/");

  alexaApp.dictionary = { "start_synonym": ["turn on", "start", "enable"], 
                          "stop_synonym":  ["turn off", "stop", "disable"] };

  alexaApp.error = console.error

  alexaApp.pre = function(request, response, type) {
    if (request.data.session.user.accessToken == undefined) {
      response.linkAccount().say("please link the switcher dood account").send()
    }
  };

  alexaApp.intent('GetDoodStatus', {
      "slots": { },
      "utterances": [
        "state", "status", "the status", "{ what\'s| what is| what|whats } the status"
      ]
    }, function(req, res) {
      Switcher.create(req.data.session.user.accessToken).then(switcher => {
        switcher.getState().then(result => {
          var stringToSay = 'The dood status is unknown';

          if (result.state == 'on') {
            stringToSay = 'The dood is on for ' + result.duration_string;
          } else if (result.state == 'off') {
            stringToSay = 'The Dood is off';
          } 

          res.say(stringToSay).send();
        }).catch(function (err) {
          res.say("Cannot get dood state: " + err).send();;
        });
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
      Switcher.create(req.data.session.user.accessToken).then(switcher => {
        switcher.enable().then(result => {
          res.card({
            type: "Standard",
            title: "Switcher Dud is ON",
            text: "Switcher Dud has been turned on",
            image: {
              smallImageUrl: "https://switcher-dud.herokuapp.com/switcher-dud.png",
              largeImageUrl: "https://switcher-dud.herokuapp.com/switcher-dud.png"
            }
          }).say("Dood was turned on successfully!").send();
        }).catch(err => {
          res.say("cannot start dood").send();
        });
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

      duration_string = moment.duration(duration_ms, "ms").format("h [hours], m [minutes]");

      Switcher.create(req.data.session.user.accessToken).then(switcher => {
        switcher.enableWithDuration(duration_ms).then(result => {
          res.say(util.format("Dood was turned on for %s successfully!", duration_string)).send();
        }).catch(err => {
          res.say(util.format("cannot start dood for %s because %s", duration_string, err)).send();
        });
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
      Switcher.create(req.data.session.user.accessToken).then(switcher => {
        switcher.disable().then(result => {
          res.card({
            type: "Standard",
            title: "Switcher Dud is OFF",
            text: "Switcher Dud has been turned off",
            image: {
              smallImageUrl: "https://apkplz.com/storage/images/com/codewithcontent/switcher/android/300/switcher-dud.png",
              largeImageUrl: "https://apkplz.com/storage/images/com/codewithcontent/switcher/android/300/switcher-dud.png"
            }
          }).say("Dood was turned off successfully!").send();
        }).catch(err => {
          res.say("cannot turn off dood").send();
        })
      });

      return false;
    }
  );
}