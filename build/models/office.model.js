'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = require('bluebird');


var OfficeSchema = new _mongoose.Schema({
  ruc: {
    type: String,
    required: 'Ruc field is required'
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
    required: true
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
  campaigns: [{
    type: _mongoose.Schema.ObjectId,
    ref: 'Campaign'
  }],
  company: {
    type: _mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
});

exports.default = _mongoose2.default.model('Office', OfficeSchema);
//# sourceMappingURL=office.model.js.map