var request = require('request');
var express = require('express');
var mustacheExpress = require('mustache-express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.get('/', function( req, res ){
  res.render('dashboard');
});

app.get('/setup', function( req, res ){
	res.render('setup');
});

app.get('/sign_up', function( req, res ){
	res.render('sign_up');
});

app.get('/sign_in', function( req, res ){
	res.render('sign_in')
});

app.get('/log_out', function( req, res ){
	res.send(200)
});


var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Hopi running at http://%s:%s', host, port);

});