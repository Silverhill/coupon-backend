'use strict';
/*eslint no-invalid-this:0*/
import mongoose, {Schema} from 'mongoose';
import {registerEvents} from '../events/user.events';
import User from './user.model';
import extend from 'mongoose-schema-extend'; // eslint-disable-line

// need to define the fields of Hunter
var HunterSchema = User.schema.extend({
  role: {
    type: String,
    default: 'hunter'
  },
  score: {
    type: Number,
    default: 0
  },
  coupons: [{
    type: Schema.ObjectId,
    ref: 'Coupon'
  }],
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  }
});

HunterSchema
  .virtual('couponCount')
  .get(function() {
    return (this.coupons || []).length;
  });

registerEvents(HunterSchema);
export default mongoose.model('Hunter', HunterSchema);
