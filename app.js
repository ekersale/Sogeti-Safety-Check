var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var fs = require("fs");
var mongo_express = require('mongo-express/lib/middleware');
var mongo_express_config = require('./node_modules/mongo-express/config');

var routes = require('./routes/index');
var users = require('./routes/users/users');
var sites = require('./routes/sites/sites');
var events = require('./routes/events/events');
var geoloc = require('./routes/locations/locations');
var chat = require('./routes/chat/chat');

var app = express();



mongoose.connection.on('connected', function() {
  console.log("Mongodb connected on port 27017");
  fs.readdirSync(__dirname + '/models').forEach(function(filename) {
    if (~filename.indexOf('.js')) require(__dirname + '/models/' + filename);
  });
});

mongoose.connection.on('error', function() {
  console.error("Error trying to reach mongodb");
});

mongoose.connection.on('disconnected', function() {
  console.log("Mongodb disconnected");
});
// view engine setup

app.getError = function(status,message, err) {
  var error = new Error;
  error.message = message;
  error.status = status;
  error.error = err;
  return error;
};

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads/users/images', express.static(__dirname + '/uploads/users/images'));
app.use('/uploads/events/images', express.static(__dirname + '/uploads/events/images'));


app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/', routes);
app.use('/admin', mongo_express(mongo_express_config));
app.use('/users', users);
app.use('/events', events);
app.use('/locations', sites);
app.use('/doc', express.static(__dirname + '/docAPI'));
app.use('/geoloc', geoloc);
app.use('/chat', chat);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

mongoose.connect('mongodb://127.0.0.1/sogeti-safety-check');


module.exports = app;
