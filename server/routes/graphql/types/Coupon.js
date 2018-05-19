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
    campaign: CampaignForHunter
  }

  type CouponForMaker implements CouponBase {
    id: ID!
    code: String
    status: String
    updatedAt: Timestamp!
    campaign: CampaignForMaker
  }

  input CaptureCouponInput {
    campaignId: String!
  }

  input RedeemCouponInput {
    couponCode: String!
  }

`;
