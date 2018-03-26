export default `
  type Plan {
    _id: ID!
    quantity: Int
    couponPrice: Float
    name: String!
    totalPrice: Float
    validity: Int
    deleted: Boolean
  }

  input AddPlanInput {
    quantity: Int
    couponPrice: Float
    name: String!
    totalPrice: Float
    validity: Int
  }

  input UpdatePlanInput {
    id: String!
    quantity: Int
    couponPrice: Float
    name: String!
    totalPrice: Float
    validity: Int
  }

  input DeletePlanInput {
    id: String!
  }
`;
