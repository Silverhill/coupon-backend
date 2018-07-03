export default `

  interface UserBase {
    id: String!
    name: String
    email: String!
    provider: String
    role: UserRole!
    image: String
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

  type UserWithCompany implements UserBase {
    id: String!
    name: String
    email: String!
    provider: String
    role: UserRole!
    image: String
    company: Company
  }

  input AddUserInput {
    email: String!
    password: String!
    company: String
    name: String!
    role: String!
    gender: String
    birthDate: Timestamp
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

  type PaginatedUser {
    users: [User!]
    totalCount: Int!
  }

  type PaginatedMaker {
    makers: [Maker!]
    totalCount: Int!
  }

  type PaginatedHunter {
    hunters: [Hunter!]
    totalCount: Int!
  }

  input UpdateUserInput {
    name: String
    email: String
    upload: Upload
  }
`;
