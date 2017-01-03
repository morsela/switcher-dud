var path = require('path');
var util = require('util')
var Mixpanel = require('mixpanel');

var Switcher = require('./switcher')

var mixpanel = Mixpanel.init(process.env.MIXPANEL_KEY, {
    protocol: 'https'
});

module.exports = function(app) {
	app.get('/echo/SwitcherDud/login/', function(req, res) {
	  req.session.state       = req.query.state
	  req.session.clientId    = req.query.client_id
	  req.session.redirectURI = req.query.redirect_uri

	  res.render(path.join(__dirname+'/views/login.ejs'));  
	});

	app.post('/echo/SwitcherDud/login/', function(req, res) {
	    Switcher.login(req.body.username, req.body.password).then(accessToken => {
	    	mixpanel.track('login_success', { ip: req.connection.remoteAddress });

	        if (req.session.redirectURI != undefined) {
	            res.redirect(util.format('%s#state=%s&access_token=%s&token_type=Bearer', req.session.redirectURI, req.session.state, accessToken))
	        } else {
	            res.send("Login success")
	        }
	    }).catch(err => {
	    	mixpanel.track('login_failure', { ip: req.connection.remoteAddress });

	    	console.error(err);

	        res.send("login failed")
	    });
	});
}