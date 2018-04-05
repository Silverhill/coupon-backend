'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

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
  address: {
    type: String,
    required: true
  },
  image: String,
  totalCoupons: {
    type: Number,
    default: 0
  },
  capturedCoupons: {
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
    type: Schema.ObjectId,
    ref: 'Maker',
    required: true
  },
  branchOffices: [{
    type: Schema.ObjectId,
    ref: 'Office'
  }],
  coupons: [{
    type: Schema.ObjectId,
    ref: 'Coupon'
  }]
})

export default mongoose.model('Campaign', CampaignSchema);
