'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var CouponSchema = new Schema({
  code: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'available' //POSIBLE STATUS: available, hunted, expired, redeemed
  },
  campaign: {
    type: Schema.ObjectId,
    ref: 'Campaign',
    required: true
  },
  hunter: {
    type: Schema.ObjectId,
    ref: 'Hunter'
  },
  huntedAt: {
    type: Date,
    default: null
  },
  redeemedAt: {
    type: Date,
    default: null
  }
},
{
  timestamps: true
})

export default mongoose.model('Coupon', CouponSchema);
