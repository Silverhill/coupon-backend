export default `
  type Company {
    ruc: String!
    contributorType: String!
    businessName: String!
    legalRepresentative: String!
    economicActivity: String!
    offices: [Office!]
    campaigns: [Campaign!]
  }
`;
