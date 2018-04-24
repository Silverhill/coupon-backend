'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var all = {
  env: process.env.NODE_ENV
};

exports.default = _lodash2.default.merge(all, require('./shared'), require('./' + process.env.NODE_ENV + '.js') || {});
//# sourceMappingURL=index.js.map