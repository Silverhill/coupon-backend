'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var CompanySchema = new Schema({
  businessName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true
  },
  updatedAt: {
    type: Date,
    required: true
  },
  maker: {
    type: Schema.ObjectId,
    ref: 'Maker',
    required: true
  },
  offices: [{
    type: Schema.ObjectId,
    ref: 'Office'
  }]
})

export default mongoose.model('Company', CompanySchema);
