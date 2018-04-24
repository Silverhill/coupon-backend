'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.captureCoupon = exports.getCoupon = undefined;

var getCouponsFromCampaign = function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(models, campaignId, match) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return models.Campaign.findOne({ _id: campaignId }).populate({
              path: 'coupons',
              match: match
            });

          case 2:
            return _context3.abrupt('return', _context3.sent);

          case 3:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function getCouponsFromCampaign(_x7, _x8, _x9) {
    return _ref8.apply(this, arguments);
  };
}();

var _config = require('../../../config');

var _config2 = _interopRequireDefault(_config);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var getCoupon = exports.getCoupon = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(parent, args, _ref2) {
    var models = _ref2.models;
    var id, coupon;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            id = args.id;
            _context.next = 3;
            return models.Coupon.findOne({ _id: id });

          case 3:
            coupon = _context.sent;
            return _context.abrupt('return', coupon);

          case 5:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function getCoupon(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var captureCoupon = exports.captureCoupon = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(parent, args, _ref4) {
    var models = _ref4.models,
        request = _ref4.request;

    var campaignId, authentication, _ref5, hunterId, _ref6, hunterCoupons, _ref7, coupons, huntedCoupons, coupon, updatedCoupon;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            campaignId = args.input.campaignId;
            authentication = request.headers.authentication;
            _context2.next = 4;
            return _jsonwebtoken2.default.verify(authentication, _config2.default.secrets.session);

          case 4:
            _ref5 = _context2.sent;
            hunterId = _ref5._id;
            _context2.prev = 6;
            _context2.next = 9;
            return getCouponsFromCampaign(models, campaignId, {
              hunter: hunterId,
              status: 'hunted'
            });

          case 9:
            _ref6 = _context2.sent;
            hunterCoupons = _ref6.coupons;

            if (!(hunterCoupons.length === 1)) {
              _context2.next = 13;
              break;
            }

            throw new Error('You can only capture one coupon for this campaign.');

          case 13:
            _context2.next = 15;
            return getCouponsFromCampaign(models, campaignId, {
              status: 'available'
            });

          case 15:
            _ref7 = _context2.sent;
            coupons = _ref7.coupons;
            huntedCoupons = _ref7.huntedCoupons;
            coupon = getLastItem(coupons);
            _context2.next = 21;
            return models.Coupon.findByIdAndUpdate(coupon._id, {
              hunter: hunterId,
              status: 'hunted',
              updatedAt: new Date()
            }, { new: true });

          case 21:
            updatedCoupon = _context2.sent;
            _context2.next = 24;
            return models.Hunter.findByIdAndUpdate(hunterId, {
              '$push': { 'coupons': updatedCoupon.id },
              updatedAt: new Date()
            }, { new: true });

          case 24:
            _context2.next = 26;
            return models.Campaign.findByIdAndUpdate(campaignId, {
              huntedCoupons: huntedCoupons + 1,
              updatedAt: new Date()
            }, { new: true });

          case 26:
            return _context2.abrupt('return', updatedCoupon);

          case 29:
            _context2.prev = 29;
            _context2.t0 = _context2['catch'](6);
            return _context2.abrupt('return', _context2.t0);

          case 32:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[6, 29]]);
  }));

  return function captureCoupon(_x4, _x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

function getLastItem(items) {
  return items.pop();
}
//# sourceMappingURL=coupon.resolver.js.map