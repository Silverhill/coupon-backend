'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var CompanySchema = new Schema({
  businessName: {
    type: String,
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
  }],
  logo: String,
  slogan: String
},
{
  timestamps: true
})

export default mongoose.model('Company', CompanySchema);
