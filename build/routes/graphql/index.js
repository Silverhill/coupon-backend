'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _apolloServerExpress = require('apollo-server-express');

var _graphqlTools = require('graphql-tools');

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

var _apolloUploadServer = require('apollo-upload-server');

var _models = require('./models');

var _models2 = _interopRequireDefault(_models);

var _types = require('./types');

var _types2 = _interopRequireDefault(_types);

var _resolvers = require('./resolvers');

var _resolvers2 = _interopRequireDefault(_resolvers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

// Mongo dB models

// GraphQl Types

// Resolvers


// settings
var schema = (0, _graphqlTools.makeExecutableSchema)({
  typeDefs: _types2.default,
  resolvers: _resolvers2.default
});

var helperMiddleware = [_express2.default.json(), (0, _apolloUploadServer.apolloUploadExpress)()];

var formatError = function formatError(error) {
  return {
    message: error.message
  };
};

router.use.apply(router, ['/graphql'].concat(helperMiddleware, [(0, _apolloServerExpress.graphqlExpress)(function (request) {
  return {
    schema: schema,
    formatError: formatError,
    context: {
      request: request,
      models: _models2.default
    }
  };
})]));

if (_config2.default.env === 'development') {
  router.use('/graphiql', (0, _apolloServerExpress.graphiqlExpress)({ endpointURL: '/graphql' }));
}

exports.default = router;
//# sourceMappingURL=index.js.map