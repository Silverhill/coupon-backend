'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var CompanySchema = new Schema({
  ruc: {
    type: String,
    required: 'Ruc field is required',
  },
  contributorType: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  legalRepresentative: {
    type: String,
    required: true
  },
  economicActivity: {
    type: String,
    required: true
  },
  offices: [{
    type: Schema.ObjectId,
    ref: 'Office'
  }],
  campaigns: [{
    type: Schema.ObjectId,
    ref: 'Campaign'
  }]
})

export default mongoose.model('Company', CompanySchema);
