/* eslint-disable no-console */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

var _hunter = require('../models/hunter.model');

var _hunter2 = _interopRequireDefault(_hunter);

var _maker = require('../models/maker.model');

var _maker2 = _interopRequireDefault(_maker);

var _ = require('./');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var seedDatabaseIfNeeded = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var users;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _user2.default.find();

          case 2:
            users = _context.sent;


            if (_2.default.seedDB && !users.length) {
              _user2.default.find({}).remove().then(function () {
                _user2.default.create({
                  provider: 'local',
                  role: 'admin',
                  name: 'Admin',
                  email: 'admin@example.com',
                  password: 'admin',
                  createdAt: new Date(),
                  updatedAt: new Date()
                }).then(function () {
                  return console.log('finished populating users');
                }).catch(function (err) {
                  return console.log('error populating users', err);
                });
              });
              _hunter2.default.find({}).remove().then(function () {
                _hunter2.default.create({
                  provider: 'local',
                  name: 'Hunter',
                  email: 'hunter@example.com',
                  password: 'hunter',
                  createdAt: new Date(),
                  updatedAt: new Date()
                }).then(function () {
                  return console.log('finished populating hunters');
                }).catch(function (err) {
                  return console.log('error populating hunters', err);
                });
              });
              _maker2.default.find({}).remove().then(function () {
                _maker2.default.create({
                  provider: 'local',
                  name: 'Maker',
                  email: 'maker@example.com',
                  password: 'maker',
                  createdAt: new Date(),
                  updatedAt: new Date()
                }).then(function () {
                  return console.log('finished populating makers');
                }).catch(function (err) {
                  return console.log('error populating makers', err);
                });
              });
            }

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function seedDatabaseIfNeeded() {
    return _ref.apply(this, arguments);
  };
}();

exports.default = seedDatabaseIfNeeded;
//# sourceMappingURL=seed.js.map