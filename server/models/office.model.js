'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';
import { isValidEmail } from '../services/validation.service';

var OfficeSchema = new Schema({
  ruc: {
    type: String,
    required: 'Ruc field is required',
  },
  economicActivity: {
    type: String,
    required: true
  },
  contributorType: {
    type: String,
    required: true
  },
  legalRepresentative: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  officePhone: String,
  cellPhone: String,
  address: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    required: true,
  },
  campaigns: [{
    type: Schema.ObjectId,
    ref: 'Campaign'
  }],
  company: {
    type: Schema.ObjectId,
    ref: 'Company',
    required: true
  }
},
{
  timestamps: true
})

OfficeSchema
  .path('email')
  .validate(function () {
    return isValidEmail(this.email);
  },
  'Invalid email format.');

export default mongoose.model('Office', OfficeSchema);
