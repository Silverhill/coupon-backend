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
  coupons: [{
    type: Schema.ObjectId,
    ref: 'Coupon'
  }]
});

HunterSchema
  .virtual('couponCount')
  .get(function() {
    return this.coupons.length;
  });

registerEvents(HunterSchema);
export default mongoose.model('Hunter', HunterSchema);
