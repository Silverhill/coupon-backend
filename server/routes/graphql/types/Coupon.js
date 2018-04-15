export default `
  interface CouponBase {
    id: ID!
    code: String
    status: String
  }

  type Coupon implements CouponBase {
    id: ID!
    code: String
    status: String
  }

  type CouponHunted implements CouponBase {
    id: ID!
    code: String
    status: String
    campaign: Campaign
  }

  input CaptureCouponInput {
    campaignId: String!
  }
`;
