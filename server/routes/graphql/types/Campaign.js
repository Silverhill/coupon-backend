export default `
  type Campaign {
    creationDate: String!
    expirationDate: String!
    location: String
    image: String
    couponsNumer: Int
    title: String!
    description: String
    caption: String
    coupons: [Coupon!]
  }
`;
