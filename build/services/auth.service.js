'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _expressJwt = require('express-jwt');

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _composableMiddleware = require('composable-middleware');

var _composableMiddleware2 = _interopRequireDefault(_composableMiddleware);

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var validateJwt = (0, _expressJwt2.default)({
  secret: _config2.default.secrets.session
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return (0, _composableMiddleware2.default)()
  // Validate jwt
  .use(function (req, res, next) {
    // allow access_token to be passed through query parameter as well
    if (req.query && req.query.hasOwnProperty('access_token')) {
      req.headers.authorization = 'Bearer ' + req.query.access_token;
    }
    // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
    if (req.query && typeof req.headers.authorization === 'undefined') {
      req.headers.authorization = 'Bearer ' + req.cookies.token;
    }
    validateJwt(req, res, next);
  })
  // Attach user to request
  .use(function (req, res, next) {
    _user2.default.findById(req.user._id).exec().then(function (user) {
      if (!user) {
        return res.status(401).end();
      }
      req.user = user;
      next();
    }).catch(function (err) {
      return next(err);
    });
  });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  return (0, _composableMiddleware2.default)().use(isAuthenticated()).use(function meetsRequirements(req, res, next) {
    if (_config2.default.userRoles.indexOf(req.user.role) >= _config2.default.userRoles.indexOf(roleRequired)) {
      return next();
    } else {
      return res.status(403).send('Forbidden');
    }
  });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id, role) {
  return _jsonwebtoken2.default.sign({ _id: id, role: role }, _config2.default.secrets.session, {
    expiresIn: 60 * 60 * 5
  });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) {
    return res.status(404).send('It looks like you aren\'t logged in, please try again.');
  }
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', token);
  res.redirect('/');
}
//# sourceMappingURL=auth.service.js.map