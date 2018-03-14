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
    # Register user but not login
    register(user: NewUser): User!

    # Login user with email and password
    login(email: String!, password: String!): String!

    # Only admin user can create a plan
    createPlan(plan: NewPlan): Plan!

    # Only current user can change password
    changePassword(oldPass: String!, newPass: String!): User!
  }
`;
