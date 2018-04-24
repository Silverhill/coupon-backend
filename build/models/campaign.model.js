'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = require('bluebird');


var CampaignSchema = new _mongoose.Schema({
  startAt: {
    type: Date,
    required: true
  },
  endAt: {
    type: Date,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  image: String,
  totalCoupons: {
    type: Number,
    default: 0
  },
  huntedCoupons: {
    type: Number,
    default: 0
  },
  redeemedCoupons: {
    type: Number,
    default: 0
  },
  initialAgeRange: {
    type: Number,
    default: 18
  },
  finalAgeRange: {
    type: Number,
    default: 60
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  customMessage: String,
  deleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    required: true
  },
  updatedAt: {
    type: Date,
    required: true
  },
  maker: {
    type: _mongoose.Schema.ObjectId,
    ref: 'Maker',
    required: true
  },
  office: {
    type: _mongoose.Schema.ObjectId,
    ref: 'Office'
  },
  coupons: [{
    type: _mongoose.Schema.ObjectId,
    ref: 'Coupon'
  }]
});

CampaignSchema.virtual('status').get(function () {
  var now = Date.now();
  if (now < this.startAt.getTime()) {
    return _config2.default.campaignStatus.UNAVAILABLE;
  }
  if (now >= this.startAt.getTime() && now < this.endAt.getTime()) {
    if (this.huntedCoupons < this.totalCoupons) {
      return _config2.default.campaignStatus.AVAILABLE;
    } else {
      return _config2.default.campaignStatus.SOLDOUT;
    }
  }
  if (now >= this.endAt.getTime()) {
    return _config2.default.campaignStatus.EXPIRED;
  }
});

exports.default = _mongoose2.default.model('Campaign', CampaignSchema);
//# sourceMappingURL=campaign.model.js.map