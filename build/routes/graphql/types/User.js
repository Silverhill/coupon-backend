"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = "\n\n  interface UserBase {\n    id: String!\n    name: String\n    email: String!\n    provider: String\n    role: UserRole!\n  }\n\n  enum UserRole {\n    hunter\n    maker\n    admin\n  }\n\n  type User implements UserBase {\n    id: String!\n    name: String\n    email: String!\n    provider: String\n    role: UserRole!\n    image: String\n  }\n\n  input AddUserInput {\n    email: String!\n    password: String!\n    company: String!\n    name: String!\n    role: String\n  }\n\n  input UpdatePasswordInput {\n    oldPass: String!\n    newPass: String!\n  }\n\n  input CredentialsInput {\n    email: String!\n    password: String!\n  }\n\n  type Token {\n    token: String!\n  }\n\n  type PaginatedUser {\n    users: [User!]\n    totalCount: Int!\n  }\n\n  type PaginatedMaker {\n    makers: [Maker!]\n    totalCount: Int!\n  }\n\n  type PaginatedHunter {\n    hunters: [Hunter!]\n    totalCount: Int!\n  }\n";
//# sourceMappingURL=User.js.map