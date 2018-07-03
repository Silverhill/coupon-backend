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
    gender: String!
    birthDate: Timestamp!
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
    gender: String!
    birthDate: Timestamp!
  }

  type HunterSimple implements UserBase {
    id: String!
    name: String
    email: String!
    provider: String
    role: UserRole!
    image: String
    gender: String!
    birthDate: Timestamp!
  }

`
