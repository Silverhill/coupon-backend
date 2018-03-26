export default `
  type Plan {
    _id: ID!
    quantity: Int
    couponPrice: Float
    name: String!
    totalPrice: Float
    validity: Int
  }

  input AddPlanInput {
    quantity: Int
    couponPrice: Float
    name: String!
    totalPrice: Float
    validity: Int
  }
`;
