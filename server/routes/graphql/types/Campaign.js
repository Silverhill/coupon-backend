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
    huntedCoupons: Int!
    redeemedCoupons: Int!
    status: String!
    title: String!
    description: String
    customMessage: String
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
    customMessage: String
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
    customMessage: String
    initialAgeRange: Int
    finalAgeRange: Int
  }

  input DeleteCampaignInput {
    id: String!
  }
`;
