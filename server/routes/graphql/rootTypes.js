export default `
  type Query {
    # User login
    signIn(email: String!, password: String!): Token!

    # Get all users. Access: Admin
    allUsers(limit: Int, skip: Int, sortField: String, sortDirection: Int): PaginatedUser!

    # Get all makers. Access: Admin, Maker
    allMakers(limit: Int, skip: Int, sortField: String, sortDirection: Int): PaginatedMaker!

    # Get all hunters. Access: Admin, Maker, Hunter
    allHunters(limit: Int, skip: Int, sortField: String, sortDirection: Int): PaginatedHunter!

    # Get Campaign. Access: Maker
    campaign(id: String!): Campaign

    # Get all campaigns. Access: Hunter
    allCampaigns(limit: Int, skip: Int, sortField: String, sortDirection: Int): PaginatedCampaigns!

    # Get all campaigns by Maker. Access: Hunter
    campaignsByMakerId(makerId: String!): [CampaignForHunter!]

    # Get my campaigns. Access: Maker
    myCampaigns(limit: Int, skip: Int, sortField: String, sortDirection: Int): PaginatedCampaigns!

    # Get my inactive campaigns. Access: Maker
    myInactiveCampaigns(limit: Int, skip: Int, sortField: String, sortDirection: Int): PaginatedCampaigns!

    # Get coupons from a specific campaign. Access: Maker
    couponsFromCampaign(campaignId: String!): [Coupon!] @deprecated(reason:"Coupons are generated when the Hunter catches them")

    # Get user by id. Access: Admin
    getUser(id: String!): User

    # Get current user. Access: Admin, Maker, Hunter
    me: UserBase!

    # Get coupon by id. Access: Maker, Hunter
    getCoupon(id: String!): Coupon

    # Get my company. Access: Maker
    myCompany: Company

    # Get my offices. Access: Maker
    myOffices: [Office!]

    # Get hunters by Campaign. Access: Maker
    huntersByCampaign(campaignId: String!): [Hunter!]

    # Get hunted coupons in a specific Campaign. Access: Maker
    huntedCouponsByCampaign(campaignId: String!): [Coupon!]

    # Get hunted coupons in a specific Campaign. Access: Maker
    couponsByCampaignAndHunter(campaignId: String!, hunterId: String!): [Coupon!]

    # Get my coupons. Access: Hunter
    myCoupons(limit: Int, skip: Int, sortField: String, sortDirection: Int): [CouponBase!]

    myRedeemedCoupons(limit: Int, skip: Int, sortField: String, sortDirection: Int): [CouponBase!]

    # Get office. Access: Maker
    office(id: String!): Office

    myHunters: [HunterOfCompany!]

    publicCampaigns(limit: Int, skip: Int, sortField: String, sortDirection: Int): PaginatedPublicCampaigns!
  }

  type Mutation {

    register(input: AddUserInput): User! @deprecated(reason:"Please use 'signUn' mutation")

    login(email: String!, password: String!): String! @deprecated(reason:"Please use 'signIn' query")

    # User register
    signUp(input: AddUserInput): UserWithCompany!

    # Update user password. Access: Admin, Maker, Hunter
    updatePassword(input: UpdatePasswordInput): User!

    # Create new Campaign. Access: Maker
    addCampaign(input: AddCampaignInput): Campaign!

    # Update an existing Campaign. Access: Maker
    updateCampaign(input: UpdateCampaignInput): Campaign!

    # Delete an existing Campaign. Access: Maker
    deleteCampaign(input: DeleteCampaignInput): Campaign!

    # Capture a coupon from a specific Campaign. Access: Hunter
    captureCoupon(input: CaptureCouponInput!): CouponHunted!

    # Create new Company. Access: Maker
    addCompany(input: CompanyInput!): Company!

    # Create new Office. Access: Maker
    addOffice(input: OfficeInput!): Office!

    # Core sample for Image Uploader
    singleUpload(file: Upload!): File!

    # upload user image
    addImageToUser(upload: Upload!): User!

    # upload company logo
    addImageToCompany(upload: Upload!): Company!

    # Redeem a coupon. Access: Hunter
    redeemCoupon(input: RedeemCouponInput!): CouponHunted!

    # Update an existing Company. Access: Maker
    updateCompany(input: UpdateCompanyInput): Company!

    # Update User info. Access: Maker, Hunter
    updateUser(input: UpdateUserInput): UserBase!

  }

  type Subscription {
    redeemedCoupon: CouponHunted!
    huntedCoupon: CouponHunted!
    expiredCampaign: Campaign!
  }
`;
