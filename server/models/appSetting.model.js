'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var AppSettingSchema = new Schema({
  scoreRedeemCoupon: {
    type: Number,
    default: 1,
    min: 1,
    max: 20
  }
},
{
  timestamps: true
})

export default mongoose.model('AppSetting', AppSettingSchema);
