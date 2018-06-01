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
    background: String
    deleted: Boolean
    createdAt: Timestamp!
    coupons: [Coupon!]
    maker: UserBase
    office: Office
    rangeAge: [Int]
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
    background: String
    deleted: Boolean
    createdAt: Timestamp!
    couponsHuntedByMe: Int!
    couponsRedeemedByMe: Int!
    canHunt: Boolean!
    coupons: [Coupon!]
    maker: UserBase
    office: Office
    remainingCoupons: Int!
    rangeAge: [Int]
  }

  type CampaignForMaker {
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
    background: String
    deleted: Boolean
    createdAt: Timestamp!
    remainingCoupons: Int!
    rangeAge: [Int]
  }

  type PublicCampaigns {
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
    remainingCoupons: Int!
    createdAt: Timestamp!
    office: PublicOffice
    rangeAge: [Int]
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
    background: String
    description: String
    customMessage: String
    officeId: String!
    upload: Upload
    rangeAge: [Int]
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
    background: String
    description: String
    customMessage: String
    rangeAge: [Int]
  }

  input DeleteCampaignInput {
    id: String!
  }

  type PaginatedCampaigns {
    campaigns: [CampaignForHunter!]
    totalCount: Int!
  }

  type PaginatedPublicCampaigns {
    campaigns: [PublicCampaigns!]
    totalCount: Int!
  }
`;
