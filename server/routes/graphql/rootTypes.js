export default `
  type Query {
    # User login
    signIn(email: String!, password: String!): Token!

    # Get all users. Access: Admin
    allUsers: [User!]!

    # Get all makers. Access: Admin, Maker
    allMakers: [Maker!]!

    # Get all hunters. Access: Admin, Maker, Hunter
    allHunters: [Hunter!]!

    # Get Campaign. Access: Admin, Maker
    campaign(id: String!): Campaign!

    # Get all campaigns. Access: Admin, Maker
    allCampaigns: [Campaign!]!

    # Get my campaigns. Access: Admin, Maker
    myCampaigns: [Campaign]!

    # Get coupons from a specific campaign. Access: Admin, Maker
    couponsFromCampaign(campaignId: String!): [Coupon]!

    # Get user by id. Access: Admin
    getUser(id: String!): User!

    # Get current user. Access: Admin, Maker, Hunter
    me: User!

    # Get coupon by id. Access: Admin, Maker, Hunter
    getCoupon(id: String!): Coupon!
  }

  type Mutation {

    register(input: AddUserInput): User! @deprecated(reason:"Please use 'signUn' mutation")

    login(email: String!, password: String!): String! @deprecated(reason:"Please use 'signIn' query")

    # User register
    signUp(input: AddUserInput): User!

    # Update user password. Access: Admin, Maker, Hunter
    updatePassword(input: UpdatePasswordInput): User!

    # Create new Campaign. Access: Admin, Maker
    addCampaign(input: AddCampaignInput): Campaign!

    # Update an existing Campaign. Access: Admin, Maker
    updateCampaign(input: UpdateCampaignInput): Campaign!

    # Delete an existing Campaign. Access: Admin, Maker
    deleteCampaign(input: DeleteCampaignInput): Campaign!

    # Capture a coupon from a specific Campaign. Access: Admin, Hunter
    captureCoupon(input: CaptureCouponInput!): Coupon!
  }
`;
