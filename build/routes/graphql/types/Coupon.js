"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = "\n  interface CouponBase {\n    id: ID!\n    code: String\n    status: String\n  }\n\n  type Coupon implements CouponBase {\n    id: ID!\n    code: String\n    status: String\n  }\n\n  type CouponHunted implements CouponBase {\n    id: ID!\n    code: String\n    status: String\n    campaign: Campaign\n  }\n\n  input CaptureCouponInput {\n    campaignId: String!\n  }\n";
//# sourceMappingURL=Coupon.js.map