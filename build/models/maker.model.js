'use strict';
/*eslint no-invalid-this:0*/

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _user = require('../events/user.events');

var _user2 = require('./user.model');

var _user3 = _interopRequireDefault(_user2);

var _mongooseSchemaExtend = require('mongoose-schema-extend');

var _mongooseSchemaExtend2 = _interopRequireDefault(_mongooseSchemaExtend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = require('bluebird');
// eslint-disable-line

// need to define the fields of Maker
var MakerSchema = _user3.default.schema.extend({
  role: {
    type: String,
    default: 'maker'
  },
  company: {
    type: _mongoose.Schema.ObjectId,
    ref: 'Company'
  },
  campaigns: [{
    type: _mongoose.Schema.ObjectId,
    ref: 'Campaign'
  }]
});

(0, _user.registerEvents)(MakerSchema);
exports.default = _mongoose2.default.model('Maker', MakerSchema);
//# sourceMappingURL=maker.model.js.map