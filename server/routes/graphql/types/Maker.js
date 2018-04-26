export default `
  type Maker implements UserBase {
    id: String!
    name: String
    email: String!
    provider: String
    role: UserRole!
    image: String
    campaigns: [Campaign!]!
  }
`
