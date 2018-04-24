'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractUserIdFromToken = undefined;

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var extractUserIdFromToken = exports.extractUserIdFromToken = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(token) {
    var _ref2, _id;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return _jsonwebtoken2.default.verify(token, _config2.default.secrets.session);

          case 3:
            _ref2 = _context.sent;
            _id = _ref2._id;
            return _context.abrupt('return', _id);

          case 8:
            _context.prev = 8;
            _context.t0 = _context['catch'](0);
            return _context.abrupt('return', null);

          case 11:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[0, 8]]);
  }));

  return function extractUserIdFromToken(_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=model.service.js.map