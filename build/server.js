'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _home = require('./routes/home');

var _home2 = _interopRequireDefault(_home);

var _user = require('./routes/user');

var _user2 = _interopRequireDefault(_user);

var _auth = require('./routes/auth');

var _auth2 = _interopRequireDefault(_auth);

var _graphql = require('./routes/graphql');

var _graphql2 = _interopRequireDefault(_graphql);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _seed = require('./config/seed');

var _seed2 = _interopRequireDefault(_seed);

var _cloudinary = require('cloudinary');

var _cloudinary2 = _interopRequireDefault(_cloudinary);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-console */

var app = (0, _express2.default)();

app.use((0, _expressSession2.default)({
  secret: 'couponsecret123',
  resave: false,
  saveUninitialized: true
}));

app.set('port', _config2.default.port);
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));

// Api doc
app.use('/apidoc', _express2.default.static(_path2.default.join(__dirname, '..', 'apidoc')));

var v1 = _express2.default.Router();

_mongoose2.default.Promise = global.Promise;

_mongoose2.default.connect(_config2.default.mongoUrl, { useMongoClient: true }, function (error) {
  if (error) {
    console.error('Please make sure Mongodb is installed and running!');
    throw error;
  }
});

_mongoose2.default.connection.once('open', function () {
  console.log('Mongodb: connection successful!!');
  (0, _seed2.default)();
});

//////////////// API ROUTES ////////////////
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authentication");
  if ('OPTIONS' === req.method) {
    res.send(200);
  } else {
    next();
  }
});
//Users
v1.use('/', _home2.default);
v1.use('/users', _user2.default);
v1.use('/', _graphql2.default);

//Auth
v1.use('/auth', _auth2.default);

////////////////////////////////////////////

// Api version
app.use('/v1', v1);

// Default API Version
app.use('/', v1);

// catch 404 and forward to error handler
app.use(function (req, res) {
  res.status(404).json({
    message: 'Route not found'
  });
});

app.listen(app.get('port'), function (error) {
  if (error) {
    console.log(error);
  } else {
    console.log('COUPON API is running on port', app.get('port'));
  }
});

_mkdirp2.default.sync(_config2.default.uploadsFolder);

_cloudinary2.default.config(_config2.default.cloudinary);

exports.default = app;
//# sourceMappingURL=server.js.map