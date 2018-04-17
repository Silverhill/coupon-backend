export default `
  type Office {
    id: ID!
    ruc: String!
    economicActivity: String!
    contributorType: String!
    legalRepresentative: String!
    name: String!
    officePhone: String
    cellPhone: String
    email: String!
    company: Company!
  }

  type OfficeBase {
    id: ID!
    ruc: String!
    economicActivity: String!
    contributorType: String!
    legalRepresentative: String!
    name: String!
    officePhone: String
    cellPhone: String
    email: String!
  }

  input OfficeInput {
    ruc: String!
    economicActivity: String!
    contributorType: String!
    legalRepresentative: String!
    name: String!
    officePhone: String
    cellPhone: String
    address: String! @deprecated(reason:"Unused address, please use officeId")
    email: String!
    companyId: String!
  }
`
