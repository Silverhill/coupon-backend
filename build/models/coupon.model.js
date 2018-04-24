'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = require('bluebird');


var CouponSchema = new _mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'available' //POSIBLE STATUS: available, hunted, expired, redeemed
  },
  createdAt: {
    type: Date,
    required: true
  },
  updatedAt: {
    type: Date,
    required: true
  },
  campaign: {
    type: _mongoose.Schema.ObjectId,
    ref: 'Campaign',
    required: true
  },
  hunter: {
    type: _mongoose.Schema.ObjectId,
    ref: 'Hunter'
  }
});

exports.default = _mongoose2.default.model('Coupon', CouponSchema);
//# sourceMappingURL=coupon.model.js.map