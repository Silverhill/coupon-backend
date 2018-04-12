export default `
  type Company {
    id: ID!
    businessName: String!
    offices: [Office!]
    campaigns: [Campaign!]
  }

  input CompanyInput {
    businessName: String!
  }
`;
