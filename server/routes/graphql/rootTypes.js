export default `
  type Query {
    # User login
    signIn(email: String!, password: String!): Token!

    # Get all users. Access: Admin
    allUsers(limit: Int, skip: Int): [User!]!

    # Get all makers. Access: Admin, Maker
    allMakers(limit: Int, skip: Int): [Maker!]!

    # Get all hunters. Access: Admin, Maker, Hunter
    allHunters(limit: Int, skip: Int): [Hunter!]!

    # Get Campaign. Access: Admin, Maker
    campaign(id: String!): Campaign!

    # Get all campaigns. Access: Admin, Maker
    allCampaigns(limit: Int, skip: Int): [Campaign!]!

    # Get my campaigns. Access: Admin, Maker
    myCampaigns: [Campaign]!

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
  }
`;
