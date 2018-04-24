'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = require('bluebird');


var CompanySchema = new _mongoose.Schema({
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
    type: _mongoose.Schema.ObjectId,
    ref: 'Maker',
    required: true
  },
  offices: [{
    type: _mongoose.Schema.ObjectId,
    ref: 'Office'
  }],
  logo: String,
  slogan: String
});

exports.default = _mongoose2.default.model('Company', CompanySchema);
//# sourceMappingURL=company.model.js.map