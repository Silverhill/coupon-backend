export default `
  type Query {
    allUsers: [User!]!
    allMakers: [Maker!]!
    allHunters: [Hunter!]!
    getUser(id: String!): User
    me: User!
  }

  type Mutation {
    register(user: NewUser): User!
    login(email: String!, password: String!): String!
  }
`;
