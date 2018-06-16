export default `
  type Hunter implements UserBase {
    id: String!
    name: String
    email: String!
    provider: String
    role: UserRole!
    image: String
    score: Int!
    coupons: [Coupon]
    couponsInCampaign: Int
  }

  type HunterOfCompany implements UserBase {
    id: String!
    name: String
    email: String!
    provider: String
    role: UserRole!
    image: String
    redeemedCoupons: Int
    huntedCoupons: Int
  }


`
