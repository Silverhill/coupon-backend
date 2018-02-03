'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var OfficeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  officePhone: Number,
  cellPhone: Number,
  location: String,
  email: {
    type: String,
    lowercase: true,
    required: true,
  },
  company: {
    type: Schema.ObjectId,
    ref: 'Company'
  },
  plan: {
    type: Schema.ObjectId,
    ref: 'Plan'
  }
})

export default mongoose.model('Office', OfficeSchema);
