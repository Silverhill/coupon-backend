export default `
  type Query {
    # Login user
    signIn(email: String!, password: String!): Token!

    # Get all users only with admin role
    allUsers: [User!]!

    # Get all makers
    allMakers: [Maker!]!

    # Get all hunters
    allHunters: [Hunter!]!

    # Get all plans
    allPlans: [Plan!]!

    plan(id: String!): Plan!

    # Get all campaigns
    allCampaigns: [Campaign!]!

    # Get my campaigns only makers
    myCampaigns: [Campaign]!

    # Get user by id
    getUser(id: String!): User!

    # Get current user
    me: User!

    # Get coupon by id
    getCoupon(id: String!): Coupon!
  }

  type Mutation {

    register(input: AddUserInput): User! @deprecated(reason:"Please use 'signUn' mutation")

    login(email: String!, password: String!): String! @deprecated(reason:"Please use 'signIn' mutation")

    # Register new user
    signUp(input: AddUserInput): User!

    # Only admin user can create a plan
    addPlan(input: AddPlanInput): Plan!

    # Update a plan
    updatePlan(input: UpdatePlanInput): Plan!

    # Delete a plan
    deletePlan(input: DeletePlanInput): Plan!

    # Only current user can change password
    updatePassword(input: UpdatePasswordInput): User!

    addCampaign(input: AddCampaignInput): Campaign!
  }
`;
