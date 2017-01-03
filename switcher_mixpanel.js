const ALLOW_MIXPANEL = true

if (ALLOW_MIXPANEL) {
	var Mixpanel = require('mixpanel');

	var mixpanel = Mixpanel.init(process.env.MIXPANEL_KEY, {
    	protocol: 'https'
	});
}

module.exports.track = function(event_name, request) {
	if (ALLOW_MIXPANEL) {
    	mixpanel.track(event_name, { ip: request.headers['x-forwarded-for'] || request.connection.remoteAddress });
    }
}