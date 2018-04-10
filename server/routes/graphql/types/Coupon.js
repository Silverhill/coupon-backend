export default `
  type Coupon {
    id: ID!
    code: String
    status: String
  }

  input CaptureCouponInput {
    campaignId: String!
  }
`;
