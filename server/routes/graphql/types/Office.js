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
    address: String!
    email: String!
    company: Company!
  }

  type OfficeSimple {
    id: ID!
    ruc: String!
    economicActivity: String!
    contributorType: String!
    legalRepresentative: String!
    name: String!
    officePhone: String
    cellPhone: String
    address: String!
    email: String!
  }

  type PublicOffice {
    id: ID!
    economicActivity: String!
    contributorType: String!
    legalRepresentative: String!
    name: String!
    officePhone: String
    cellPhone: String
    address: String!
    email: String!
    company: PublicCompany
  }

  input OfficeInput {
    ruc: String!
    economicActivity: String!
    contributorType: String!
    legalRepresentative: String!
    name: String!
    officePhone: String
    cellPhone: String
    address: String!
    email: String!
    companyId: String!
  }
`
