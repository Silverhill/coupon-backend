'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';
import {registerEvents} from '../events/user.events';
import User from './user.model';
import extend from 'mongoose-schema-extend'; // eslint-disable-line

// need to define the fields of Maker
var MakerSchema = User.schema.extend({
  role: {
    type: String,
    default: 'maker'
  },
  campaigns: [{
    type: Schema.ObjectId,
    ref: 'Campaign'
  }]
});

registerEvents(MakerSchema);
export default mongoose.model('Maker', MakerSchema);
