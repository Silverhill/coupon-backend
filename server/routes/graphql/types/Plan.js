export default `
  type Plan {
    _id: ID!
    quantity: Int
    couponPrice: Float
    name: String!
    totalPrice: Float
    validity: Int
  }

  input NewPlan {
    quantity: Int
    couponPrice: Float
    name: String!
    totalPrice: Float
    validity: String
  }
`;
