export default `
  scalar Timestamp

  type Campaign {
    _id: ID!
    startAt: Timestamp!
    endAt: Timestamp!
    address: String
    country: String
    city: String
    image: String
    couponsNumber: Int!
    title: String!
    description: String
    caption: String
    coupons: [Coupon!]
    deleted: Boolean
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
    caption: String
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
    caption: String
  }

  input DeleteCampaignInput {
    id: String!
  }
`;
