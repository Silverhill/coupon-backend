'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

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
  officePhone: Number,
  cellPhone: Number,
  address: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true
  },
  updatedAt: {
    type: Date,
    required: true
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
})

export default mongoose.model('Office', OfficeSchema);
