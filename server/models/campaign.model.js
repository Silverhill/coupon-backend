'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';
import config from '../config';
import * as validator from '../services/validation.service';

var CampaignSchema = new Schema({
  startAt: {
    type: Date,
    required: true
  },
  endAt: {
    type: Date,
    required: true
  },
  background: {
    type: String,
    default: ''
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
  title: {
    type: String,
    required: true
  },
  description: String,
  customMessage: String,
  expired: {
    type: Boolean,
    default: false
  },
  deleted: {
    type: Boolean,
    default: false
  },
  maker: {
    type: Schema.ObjectId,
    ref: 'Maker',
    required: true
  },
  office: {
    type: Schema.ObjectId,
    ref: 'Office'
  },
  coupons: [{
    type: Schema.ObjectId,
    ref: 'Coupon'
  }],
  rangeAge: [Number]
},
{
  timestamps: true
})

CampaignSchema.virtual('remainingCoupons')
  .get(function (){
    return this.totalCoupons - this.huntedCoupons;
  })


CampaignSchema.virtual('status')
  .get(function () {
    const now = Date.now();
    if (now < this.startAt.getTime()) {
      return config.campaignStatus.UNAVAILABLE;
    }
    if (now >= this.startAt.getTime() && now < this.endAt.getTime()) {
      if (this.huntedCoupons < this.totalCoupons) {
        return config.campaignStatus.AVAILABLE;
      } else {
        return config.campaignStatus.SOLDOUT;
      }
    }
    if (this.expired || (now >= this.endAt.getTime())) {
      return config.campaignStatus.EXPIRED;
    }
  });

  CampaignSchema
    .path('endAt')
    .validate(function () {
      return this.endAt.getTime() > this.startAt.getTime()
    },
    'endAt should be greater than startAt.')

  CampaignSchema
    .path('background')
    .validate(function (value) {
      return isValidBackgroundFormat(value);
    },
    'Invalid Background format.')

const isValidBackgroundFormat = (value) => {
  if (value === '') {
    return true;
  }

  if (validator.isValidRgbColor(value) ||
      validator.isValidHexColor(value) ||
      validator.isValidUrl(value) ||
      validator.isValidLinearGradient(value) ||
      validator.isValidRadialGradient(value)) {
    return true;
  } else {
    return false;
  }
}


export default mongoose.model('Campaign', CampaignSchema);
