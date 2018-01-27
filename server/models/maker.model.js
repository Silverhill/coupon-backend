'use strict';
/*eslint no-invalid-this:0*/
import mongoose from 'mongoose';
import {registerEvents} from '../events/user.events';
import User from './user.model';
import extend from 'mongoose-schema-extend'; // eslint-disable-line

// need to define the fields of Maker
var MakerSchema = User.schema.extend({
  role: {
    type: String,
    default: 'maker'
  }
});

registerEvents(MakerSchema);
export default mongoose.model('Maker', MakerSchema);
