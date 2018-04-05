export default `
  type Hunter implements UserBase {
    id: String!
    name: String
    email: String!
    provider: String
    role: UserRole!
    coupons: [Coupon]
    couponCount: Int
  }
`
