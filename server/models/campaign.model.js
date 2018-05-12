'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';
import config from '../config';

var CampaignSchema = new Schema({
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
    default: 18,
    min: [1, 'initialAgeRange should be in the range of 1 to 99.'],
    max: [99, 'initialAgeRange should be in the range of 1 to 99.'],
    required: true
  },
  finalAgeRange: {
    type: Number,
    default: 60,
    min: [2, 'finalAgeRange should be in the range of 2 to 100.'],
    max: [100, 'finalAgeRange should be in the range of 2 to 100.'],
    required: true
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
  }]
},
{
  timestamps: true
})

CampaignSchema.virtual('remaingCoupons')
  .get(function (){
    return this.totalCoupons - this.huntedCoupons - this.redeemedCoupons;
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
    .path('initialAgeRange')
    .validate(function () {
      return this.finalAgeRange > this.initialAgeRange;
    },
    'initialAgeRange should be less than finalAgeRange.');

  CampaignSchema
    .path('endAt')
    .validate(function () {
      return this.endAt.getTime() > this.startAt.getTime()
    },
    'endAt should be greater than startAt.')


export default mongoose.model('Campaign', CampaignSchema);
