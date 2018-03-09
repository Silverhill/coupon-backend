export default `
  type Maker implements UserBase {
    _id: String!
    name: String
    email: String!
    provider: String
    role: UserRole!
  }
`
