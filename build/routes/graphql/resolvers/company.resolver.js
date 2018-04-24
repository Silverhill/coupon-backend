'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.myCompany = exports.addCompany = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var addCompanyToMaker = function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(makerId, companyId, models) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return models.Maker.findByIdAndUpdate(makerId, {
              company: companyId,
              updatedAt: new Date()
            }, { new: true });

          case 2:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function addCompanyToMaker(_x7, _x8, _x9) {
    return _ref9.apply(this, arguments);
  };
}();

var _model = require('../../../services/model.service');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _cloudinary = require('cloudinary');

var _cloudinary2 = _interopRequireDefault(_cloudinary);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _file = require('./file.resolver');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var addCompany = exports.addCompany = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(parent, args, _ref2) {
    var models = _ref2.models,
        request = _ref2.request;

    var input, authentication, makerId, _ref3, makerCompany, company, _ref4, stream, filename, _ref5, path, newCompany;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            input = args.input;
            authentication = request.headers.authentication;
            _context.next = 4;
            return (0, _model.extractUserIdFromToken)(authentication);

          case 4:
            makerId = _context.sent;
            _context.next = 7;
            return models.Maker.findOne({ _id: makerId });

          case 7:
            _ref3 = _context.sent;
            makerCompany = _ref3.company;

            if (_lodash2.default.isEmpty(makerCompany)) {
              _context.next = 11;
              break;
            }

            throw Error('Only one company can be created.');

          case 11:
            company = _extends({}, input, {
              createdAt: new Date(),
              updatedAt: new Date(),
              maker: makerId
            });

            if (!company.upload) {
              _context.next = 24;
              break;
            }

            _context.next = 15;
            return company.upload;

          case 15:
            _ref4 = _context.sent;
            stream = _ref4.stream;
            filename = _ref4.filename;
            _context.next = 20;
            return (0, _file.storeFile)({ stream: stream, filename: filename });

          case 20:
            _ref5 = _context.sent;
            path = _ref5.path;
            _context.next = 24;
            return _cloudinary2.default.v2.uploader.upload(path, function (error, result) {
              if (result) {
                company.logo = result.url;
                _fs2.default.unlinkSync(path);
              } else if (error) {
                return error;
              }
            });

          case 24:
            _context.next = 26;
            return new models.Company(company);

          case 26:
            newCompany = _context.sent;
            _context.prev = 27;
            _context.next = 30;
            return newCompany.save();

          case 30:
            _context.next = 32;
            return addCompanyToMaker(makerId, newCompany._id, models);

          case 32:
            return _context.abrupt('return', newCompany);

          case 35:
            _context.prev = 35;
            _context.t0 = _context['catch'](27);
            throw new Error(_context.t0.message || _context.t0);

          case 38:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[27, 35]]);
  }));

  return function addCompany(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var myCompany = exports.myCompany = function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(parent, args, _ref7) {
    var models = _ref7.models,
        request = _ref7.request;

    var authentication, makerId, _ref8, company;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            authentication = request.headers.authentication;
            _context2.next = 3;
            return (0, _model.extractUserIdFromToken)(authentication);

          case 3:
            makerId = _context2.sent;
            _context2.prev = 4;
            _context2.next = 7;
            return models.Maker.findOne({ _id: makerId }).populate('company');

          case 7:
            _ref8 = _context2.sent;
            company = _ref8.company;
            return _context2.abrupt('return', company);

          case 12:
            _context2.prev = 12;
            _context2.t0 = _context2['catch'](4);
            return _context2.abrupt('return', _context2.t0);

          case 15:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[4, 12]]);
  }));

  return function myCompany(_x4, _x5, _x6) {
    return _ref6.apply(this, arguments);
  };
}();
//# sourceMappingURL=company.resolver.js.map