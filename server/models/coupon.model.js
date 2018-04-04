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
    default: 'available' //posible status: available, captured, redeemed
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
    type: Schema.ObjectId,
    ref: 'Campaign',
    required: true
  },
  hunter: {
    type: Schema.ObjectId,
    ref: 'Hunter'
  }
})

export default mongoose.model('Coupon', CouponSchema);
