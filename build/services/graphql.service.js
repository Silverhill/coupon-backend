'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.roleExist = exports.filterUsersByRole = exports.requiresAuth = undefined;

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var requiresAuth = exports.requiresAuth = function requiresAuth(resolver) {
  var permissionsByRole = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(parent, args, context) {
      var headers, authentication, tokenInfo;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (resolver) {
                _context.next = 2;
                break;
              }

              return _context.abrupt('return');

            case 2:

              // Get headers from the request passed to the context grapqhl schema
              headers = context.request.headers;
              authentication = headers.authentication;

              // Verify if header authentication with token exist

              if (authentication) {
                _context.next = 6;
                break;
              }

              throw new Error('Missing token authentication.');

            case 6:
              _context.next = 8;
              return _jsonwebtoken2.default.verify(authentication, _config2.default.secrets.session);

            case 8:
              tokenInfo = _context.sent;
              _context.next = 11;
              return hasRole(tokenInfo, permissionsByRole);

            case 11:
              return _context.abrupt('return', resolver(parent, args, context));

            case 12:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function (_x2, _x3, _x4) {
      return _ref.apply(this, arguments);
    };
  }();
};

var hasRole = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref3) {
    var role = _ref3.role;
    var permissionsByRole = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (role) {
              _context2.next = 2;
              break;
            }

            throw new Error('Required role to be set.');

          case 2:
            if (permissionsByRole.includes(role)) {
              _context2.next = 4;
              break;
            }

            throw new Error('Not have permissions for ' + role + ' role.');

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function hasRole(_x5) {
    return _ref2.apply(this, arguments);
  };
}();

var filterUsersByRole = exports.filterUsersByRole = function filterUsersByRole(users, role) {
  if (!role || !users.length) return [];
  return users.filter(function (user) {
    return user.role === role;
  });
};

var roleExist = exports.roleExist = function roleExist(role) {
  return _config2.default.userRoles.includes(role);
};
//# sourceMappingURL=graphql.service.js.map