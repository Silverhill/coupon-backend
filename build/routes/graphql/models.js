'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _user = require('../../models/user.model');

var _user2 = _interopRequireDefault(_user);

var _maker = require('../../models/maker.model');

var _maker2 = _interopRequireDefault(_maker);

var _hunter = require('../../models/hunter.model');

var _hunter2 = _interopRequireDefault(_hunter);

var _campaign = require('../../models/campaign.model');

var _campaign2 = _interopRequireDefault(_campaign);

var _company = require('../../models/company.model');

var _company2 = _interopRequireDefault(_company);

var _coupon = require('../../models/coupon.model');

var _coupon2 = _interopRequireDefault(_coupon);

var _office = require('../../models/office.model');

var _office2 = _interopRequireDefault(_office);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var models = {
  User: _user2.default,
  Maker: _maker2.default,
  Hunter: _hunter2.default,
  Campaign: _campaign2.default,
  Company: _company2.default,
  Coupon: _coupon2.default,
  Office: _office2.default
}; // Mongo db Models
exports.default = models;
//# sourceMappingURL=models.js.map