'use strict';

import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';

const router = express.Router();

// Mongo dB models
import models from './models';
// GraphQl Types
import typeDefs from './types';
// Resolvers
import resolvers from './resolvers';

// settings
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const helperMiddleware = [
  express.json(),
];

const formatError = error => ({
  message: error.message,
});

router.use('/graphql', ...helperMiddleware, graphqlExpress(request => ({
  schema,
  formatError,
  context: {
    request,
    models
  }
})));

router.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql'
}));

export default router;