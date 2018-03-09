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

  input NewUser {
    email: String!
    password: String!
    name: String!
    role: String
  }
`;
