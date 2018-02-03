'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var CouponSchema = new Schema({
  creationDate: {
    type: Date,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  code: String,
  status: String
})

export default mongoose.model('Coupon', CouponSchema);
