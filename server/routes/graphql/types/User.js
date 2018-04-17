export default `

  interface UserBase {
    id: String!
    name: String
    email: String!
    provider: String
    role: UserRole!
  }

  enum UserRole {
    hunter
    maker
    admin
  }

  type User implements UserBase {
    id: String!
    name: String
    email: String!
    provider: String
    role: UserRole!
    image: String
  }

  input AddUserInput {
    email: String!
    password: String!
    company: String!
    name: String!
    role: String
  }

  input UpdatePasswordInput {
    oldPass: String!
    newPass: String!
  }

  input CredentialsInput {
    email: String!
    password: String!
  }

  type Token {
    token: String!
  }
`;
