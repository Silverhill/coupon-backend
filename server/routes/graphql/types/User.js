export default `
  interface UserBase {
    _id: String!
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
    _id: String!
    name: String
    email: String!
    provider: String
    role: UserRole!
    coupons: [Coupon]
  }

  input AddUserInput {
    email: String!
    password: String!
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
`;
