'use strict';
/*eslint no-invalid-this:0*/
import mongoose from 'mongoose';
import {registerEvents} from '../events/user.events';
import User from './user.model';
import extend from 'mongoose-schema-extend'; // eslint-disable-line

// need to define the fields of Hunter
var HunterSchema = User.schema.extend({
  role: {
    type: String,
    default: 'hunter'
  }
});

registerEvents(HunterSchema);
export default mongoose.model('Hunter', HunterSchema);
