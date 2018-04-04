export default `
  scalar Timestamp

  type Campaign {
    id: ID!
    startAt: Timestamp!
    endAt: Timestamp!
    address: String
    country: String
    city: String
    image: String
    totalCoupons: Int!
    capturedCoupons: Int!
    redeemedCoupons: Int!
    title: String!
    description: String
    deleted: Boolean
    coupons: [Coupon!]
  }

  input AddCampaignInput {
    startAt: Timestamp!
    endAt: Timestamp!
    address: String
    country: String
    city: String
    image: String
    couponsNumber: Int!
    title: String!
    description: String
    initialAgeRange: Int
    finalAgeRange: Int
  }

  input UpdateCampaignInput {
    id: String!
    startAt: Timestamp
    endAt: Timestamp
    address: String
    country: String
    city: String
    image: String
    title: String
    description: String
    initialAgeRange: Int
    finalAgeRange: Int
  }

  input DeleteCampaignInput {
    id: String!
  }
`;
