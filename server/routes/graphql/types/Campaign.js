export default `
  type Campaign {
    creationDate: String!
    expirationDate: String!
    location: String
    image: String
    couponsNumber: Int
    title: String!
    description: String
    caption: String
    coupons: [Coupon!]
  }
`;
