"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = "\n  type Office {\n    id: ID!\n    ruc: String!\n    economicActivity: String!\n    contributorType: String!\n    legalRepresentative: String!\n    name: String!\n    officePhone: String\n    cellPhone: String\n    address: String!\n    email: String!\n    company: Company!\n  }\n\n  type OfficeSimple {\n    id: ID!\n    ruc: String!\n    economicActivity: String!\n    contributorType: String!\n    legalRepresentative: String!\n    name: String!\n    officePhone: String\n    cellPhone: String\n    address: String!\n    email: String!\n  }\n\n  input OfficeInput {\n    ruc: String!\n    economicActivity: String!\n    contributorType: String!\n    legalRepresentative: String!\n    name: String!\n    officePhone: String\n    cellPhone: String\n    address: String!\n    email: String!\n    companyId: String!\n  }\n";
//# sourceMappingURL=Office.js.map