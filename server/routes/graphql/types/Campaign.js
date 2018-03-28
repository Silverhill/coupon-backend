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
`;
