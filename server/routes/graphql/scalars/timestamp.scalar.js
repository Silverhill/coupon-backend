import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

function convertToInt(str) {
  return parseInt(str, 10);
}
export const timestampScalar = new GraphQLScalarType({
  name: 'Timestamp',
  description: '',
  parseValue: convertToInt,
  serialize: convertToInt,
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      const timestamp = convertToInt(ast.value);
      const valid = (new Date(timestamp)).getTime() > 0;
      return valid ? timestamp : null;
    }
    return null;
  }
});
