var Mixpanel = require('mixpanel');

var mixpanel = Mixpanel.init(process.env.MIXPANEL_KEY, {
    protocol: 'https'
});

module.exports.track = function(event_name, request) {
    mixpanel.track(event_name, { ip: request.headers['x-forwarded-for'] || request.connection.remoteAddress });
}