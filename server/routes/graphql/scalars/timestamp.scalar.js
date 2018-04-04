import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

export const timestampScalar = new GraphQLScalarType({
  name: 'Timestamp',
  description: '',
  parseValue(value) {
    return new Date(value);
  },
  serialize(value) {
    return value.getTime();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      const timestamp = parseInt(ast.value, 10);
      const valid = (new Date(timestamp)).getTime() > 0;
      return valid ? timestamp : null;
    }
    return null;
  }
});
