var path = require('path');
var util = require('util')

var Switcher = require('./switcher')

module.exports = function(app) {
	app.get('/echo/SwitcherDud/login/', function(req, res) {
	  req.session.state       = req.query.state
	  req.session.clientId    = req.query.client_id
	  req.session.redirectURI = req.query.redirect_uri

	  res.render(path.join(__dirname+'/views/login.ejs'));  
	});

	app.post('/echo/SwitcherDud/login/', function(req, res) {
	    Switcher.login(req.body.username, req.body.password).then(accessToken => {
	        if (req.session.redirectURI != undefined) {
	            res.redirect(util.format('%s#state=%s&access_token=%s&token_type=Bearer', req.session.redirectURI, req.session.state, access_token))
	        } else {
	            res.send("Login success")
	        }
	    }).catch(err => {
	        res.send("login failed")
	    });
	});
}