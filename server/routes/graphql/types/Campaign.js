export default `
  scalar Timestamp

  type Campaign {
    id: ID!
    startAt: Timestamp!
    endAt: Timestamp!
    address: String @deprecated(reason:"Please use 'address' in the 'Campaign.office' attribute")
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
    initialAgeRange: Int
    finalAgeRange: Int
    createdAt: Timestamp!
    coupons: [Coupon!]
    maker: UserBase
    office: OfficeSimple
  }

  type CampaignForHunter {
    id: ID!
    startAt: Timestamp!
    endAt: Timestamp!
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
    initialAgeRange: Int
    finalAgeRange: Int
    createdAt: Timestamp!
    couponsHuntedByMe: Int!
    coupons: [Coupon!]
    maker: UserBase
    office: OfficeSimple
    remaingCoupons: Int!
  }

  input AddCampaignInput {
    startAt: Timestamp!
    endAt: Timestamp!
    address: String @deprecated(reason:"Please use 'officeId'")
    country: String
    city: String
    image: String
    couponsNumber: Int!
    title: String!
    description: String
    customMessage: String
    initialAgeRange: Int
    finalAgeRange: Int
    officeId: String!
    upload: Upload
  }

  input UpdateCampaignInput {
    id: String!
    startAt: Timestamp
    endAt: Timestamp
    address: String @deprecated(reason:"Unused value")
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

  type PaginatedCampaigns {
    campaigns: [CampaignForHunter!]
    totalCount: Int!
  }
`;
