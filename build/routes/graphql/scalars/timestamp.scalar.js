'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.timestampScalar = undefined;

var _graphql = require('graphql');

var _language = require('graphql/language');

var timestampScalar = exports.timestampScalar = new _graphql.GraphQLScalarType({
  name: 'Timestamp',
  description: '',
  parseValue: function parseValue(value) {
    return new Date(value);
  },
  serialize: function serialize(value) {
    return value.getTime();
  },
  parseLiteral: function parseLiteral(ast) {
    if (ast.kind === _language.Kind.INT) {
      var timestamp = parseInt(ast.value, 10);
      var valid = new Date(timestamp).getTime() > 0;
      return valid ? timestamp : null;
    }
    return null;
  }
});
//# sourceMappingURL=timestamp.scalar.js.map