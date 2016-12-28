var express    = require("express");
var bodyParser = require("body-parser");
var session    = require('express-session')

var app  = express();
var PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static('public'))
app.use(session({
  secret: '944e6073-98b4-4ffc-b486-f83c0bde0e40',
  saveUninitialized: true,
  resave: false
}))

require('./alexa.js')(app);
require('./login.js')(app);

app.listen(PORT);
console.log("Listening on port " + PORT);