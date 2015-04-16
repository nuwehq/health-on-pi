var request = require('request');
var passport = require('passport');
var NuweStrategy = require('passport-nuwe').Strategy;
var express = require('express'); 

var util = require( 'util' )
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session'); 
var RedisStore = require( 'connect-redis' )( session )
var mustacheExpress = require('mustache-express');

var app = express();
var server = require( 'http' ).createServer( app ) 

var NUWE_CLIENT_ID = "a17594f29a795a031dd4905f03e0f929b1504e34d79d8e0263938d63d359a932";
var NUWE_CLIENT_SECRET = "d8222c1b1d0a0daf86614d9c2c381465891fb147645a155251cec6c52fa0ffd3";

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new NuweStrategy({
    clientID: NUWE_CLIENT_ID,
    clientSecret: NUWE_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/nuwe/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ NuweId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));



// Configure App
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');
app.use( cookieParser('cookie_secret')); 
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({
	extended: true
}));
app.use( session({ 
	secret: 'cookie_secret',
	name:   'nuwe',
	store:  new RedisStore({
		host: '127.0.0.1',
		port: 6379
	}),
	proxy:  true,
    resave: true,
    saveUninitialized: true
}));
app.use( passport.initialize());
app.use( passport.session());


app.get('/auth/nuwe',
  passport.authenticate('nuwe'));

app.get('/auth/nuwe/callback', 
  passport.authenticate('nuwe', { failureRedirect: '/sign_in' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/', ensureAuthenticated, function( req, res ){
  res.render('dashboard', { user: req.user });
});

app.get('/setup', function( req, res ){
	res.render('setup');
});

app.get('/sign_up', function( req, res ){
	res.render('sign_up');
});

app.get('/sign_in', function( req, res ){
	res.render('sign_in');
});

app.get('/log_out', function( req, res ){
	res.send(200)
});




server.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Hopi running at http://%s:%s', host, port);

});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/sign_in')
}