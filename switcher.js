 'use strict';

var rp     = require('request-promise');
var util   = require('util')
var moment = require("moment");

require("moment-duration-format");

const BASE_URL        = "http://server.switcher.co.il/Switcher"
const GET_SWITCHES    = BASE_URL + "/appServiceGetSwitches?token=%s"
const ENABLE_CMD      = BASE_URL + "/appServiceSetSwitchState?token=%s&switchId=%s&state=on"
const DISABLE_CMD     = BASE_URL + "/appServiceSetSwitchState?token=%s&switchId=%s&state=off"
const ENABLE_DURATION = BASE_URL + "/setSpontaneousEvent?token=%s&switchId=%s&isManual=true&duration=%s"
const GET_STATE       = BASE_URL + "/appServiceGetSwitchState?token=%s&switchId=%s"

module.exports = class Switcher {
	constructor(token) {
		this.token    = token

		this.token    = "1455239767592"
		this.switchID = "1429959227412"
	}

	getSwitchId(token) {
	  rp({ uri: util.format(GET_SWITCHES, token), json: true}).then(function(body) {
	      if (body.switches.length == 1) {
	        return body.switches[0]
	      }
	    }).catch(function (err) {
	      console.log(err)
	    });
	}

	getState() {
		var switcher = this;
		return new Promise(function(resolve, reject) {
			rp({ uri: util.format(GET_STATE, switcher.token, switcher.switchID), json: true }).then(function(body) {
				var eventData 		= body.spontaneousEvent
				var duration  		= eventData.endTime - eventData.startTime - eventData.currentDuration
				var duration_string = moment.duration(duration, "ms").format("h [hours], m [minutes], s [seconds]");

				var result = {
					state: 			 body.state,
					duration: 		 duration,
					duration_string: duration_string
				}

				resolve(result)
		    }).catch(function (err) {
		      console.log(err)

		      reject(err);
		    });	
		});
	}
}
