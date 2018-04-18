export default `
  type Company {
    id: ID!
    businessName: String!
    offices: [Office!]
    campaigns: [Campaign!]
    logo: String
    slogan: String
  }

  input CompanyInput {
    businessName: String!
    upload: Upload
  }
`;
