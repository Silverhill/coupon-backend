export default `
  type Query {
    # Get all users only with admin role
    allUsers: [User!]!

    # Get all makers
    allMakers: [Maker!]!

    # Get all hunters
    allHunters: [Hunter!]!

    # Get all plans
    allPlans: [Plan!]!

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

    # Login user
    signIn(input: CredentialsInput): String!

    # Register new user
    signUp(input: AddUserInput): User!

    # Only admin user can create a plan
    addPlan(input: AddPlanInput): Plan!

    # Only current user can change password
    updatePassword(input: UpdatePasswordInput): User!
  }
`;
