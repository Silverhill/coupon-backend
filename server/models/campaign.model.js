'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var CampaignSchema = new Schema({
  creationDate: {
    type: Date,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  location: String,
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
  }]
})

export default mongoose.model('Campaign', CampaignSchema);
