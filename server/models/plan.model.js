'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var PlanSchema = new Schema({
  quantity: {
    type: Number,
    default: 0
  },
  couponPrice: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
    required: 'Name field is required',
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  validity: {
    type: Number,
    default: 0
  }
})

export default mongoose.model('Plan', PlanSchema);
