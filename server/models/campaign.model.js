'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var CampaignSchema = new Schema({
  startAt: {
    type: Number,
    required: true
  },
  endAt: {
    type: Number,
    required: true
  },
  country: String,
  city: String,
  address: String,
  image: String,
  couponsNumber: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  coupons: [{
    type: Schema.ObjectId,
    ref: 'Coupon'
  }],
  deleted: {
    type: Boolean,
    default: false
  }
})

export default mongoose.model('Campaign', CampaignSchema);
