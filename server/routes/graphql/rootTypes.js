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
    campaign(id: String!): Campaign!

    # Get all campaigns. Access: Maker
    allCampaigns(limit: Int, skip: Int, sortField: String, sortDirection: Int): PaginatedCampaigns!

    # Get all campaigns by Maker. Access: Hunter
    campaignsByMakerId(makerId: String!): [Campaign]!

    # Get my campaigns. Access: Maker
    myCampaigns: [Campaign]!

    # Get coupons from a specific campaign. Access: Maker
    couponsFromCampaign(campaignId: String!): [Coupon]!

    # Get user by id. Access: Admin
    getUser(id: String!): User!

    # Get current user. Access: Admin, Maker, Hunter
    me: UserBase!

    # Get coupon by id. Access: Maker, Hunter
    getCoupon(id: String!): Coupon!

    # Get my company. Access: Maker
    myCompany: Company!

    # Get my offices. Access: Maker
    myOffices: [Office!]

    # Get hunters by Campaign. Access: Maker
    huntersByCampaign(campaignId: String!): [User!]

    # Get my coupons. Access: Hunter
    myCoupons: [CouponBase!]

    # Get office. Access: Maker
    office(id: String!): OfficeBase!
  }

  type Mutation {

    register(input: AddUserInput): User! @deprecated(reason:"Please use 'signUn' mutation")

    login(email: String!, password: String!): String! @deprecated(reason:"Please use 'signIn' query")

    # User register
    signUp(input: AddUserInput): User!

    # Update user password. Access: Admin, Maker, Hunter
    updatePassword(input: UpdatePasswordInput): User!

    # Create new Campaign. Access: Maker
    addCampaign(input: AddCampaignInput): Campaign!

    # Update an existing Campaign. Access: Maker
    updateCampaign(input: UpdateCampaignInput): Campaign!

    # Delete an existing Campaign. Access: Maker
    deleteCampaign(input: DeleteCampaignInput): Campaign!

    # Capture a coupon from a specific Campaign. Access: Hunter
    captureCoupon(input: CaptureCouponInput!): Coupon!

    # Create new Company. Access: Maker
    addCompany(input: CompanyInput!): Company!

    # Create new Office. Access: Maker
    addOffice(input: OfficeInput!): Office!

    # Core sample for Image Uploader
    singleUpload(file: Upload!): File!

    # upload user image
    addImageToUser(image: Upload!): User!
  }
`;
