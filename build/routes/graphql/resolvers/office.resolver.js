'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOffice = exports.myOffices = exports.addOffice = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _model = require('../../../services/model.service');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

//TODO: Valida RUC
var addOffice = exports.addOffice = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(parent, args, _ref2) {
    var models = _ref2.models,
        request = _ref2.request;
    var input, companyId, authentication, makerId, makerCompany, maker, office, newOffice;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            input = args.input;
            companyId = input.companyId;
            authentication = request.headers.authentication;
            _context.next = 5;
            return (0, _model.extractUserIdFromToken)(authentication);

          case 5:
            makerId = _context.sent;
            makerCompany = null;
            _context.prev = 7;
            _context.next = 10;
            return models.Maker.findOne({ _id: makerId }).populate({
              path: 'company',
              match: {
                _id: companyId
              }
            });

          case 10:
            maker = _context.sent;


            makerCompany = maker.company;

            _context.next = 17;
            break;

          case 14:
            _context.prev = 14;
            _context.t0 = _context['catch'](7);
            throw Error('Invalid Company ID.');

          case 17:
            office = _extends({}, input, {
              createdAt: new Date(),
              updatedAt: new Date(),
              company: makerCompany._id
            });
            _context.prev = 18;
            _context.next = 21;
            return new models.Office(office);

          case 21:
            newOffice = _context.sent;
            _context.next = 24;
            return newOffice.save();

          case 24:
            _context.next = 26;
            return models.Company.findByIdAndUpdate(makerCompany._id, {
              '$push': { 'offices': newOffice.id },
              updatedAt: new Date()
            }, { new: true });

          case 26:
            return _context.abrupt('return', newOffice);

          case 29:
            _context.prev = 29;
            _context.t1 = _context['catch'](18);
            throw new Error(_context.t1.message || _context.t1);

          case 32:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[7, 14], [18, 29]]);
  }));

  return function addOffice(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var myOffices = exports.myOffices = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(parent, args, _ref4) {
    var models = _ref4.models,
        request = _ref4.request;

    var authentication, makerId, _ref5, offices;

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
            return models.Company.findOne({ maker: makerId }).populate('offices');

          case 7:
            _ref5 = _context2.sent;
            offices = _ref5.offices;
            return _context2.abrupt('return', offices);

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

  return function myOffices(_x4, _x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

var getOffice = exports.getOffice = function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(parent, args, _ref7) {
    var models = _ref7.models,
        request = _ref7.request;
    var officeId, authentication, makerId, company, office;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            officeId = args.id;
            authentication = request.headers.authentication;
            _context3.next = 4;
            return (0, _model.extractUserIdFromToken)(authentication);

          case 4:
            makerId = _context3.sent;
            _context3.prev = 5;
            _context3.next = 8;
            return models.Company.findOne({ maker: makerId });

          case 8:
            company = _context3.sent;
            _context3.next = 11;
            return models.Office.findOne({
              _id: officeId,
              company: company._id
            });

          case 11:
            office = _context3.sent;

            office.company = company;
            return _context3.abrupt('return', office);

          case 16:
            _context3.prev = 16;
            _context3.t0 = _context3['catch'](5);
            return _context3.abrupt('return', _context3.t0);

          case 19:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined, [[5, 16]]);
  }));

  return function getOffice(_x7, _x8, _x9) {
    return _ref6.apply(this, arguments);
  };
}();
//# sourceMappingURL=office.resolver.js.map