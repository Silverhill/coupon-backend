'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _apolloUploadServer = require('apollo-upload-server');

var _user = require('./resolvers/user.resolver');

var userResolver = _interopRequireWildcard(_user);

var _campaign = require('./resolvers/campaign.resolver');

var campaignResolver = _interopRequireWildcard(_campaign);

var _coupon = require('./resolvers/coupon.resolver');

var couponResolver = _interopRequireWildcard(_coupon);

var _company = require('./resolvers/company.resolver');

var companyResolver = _interopRequireWildcard(_company);

var _office = require('./resolvers/office.resolver');

var officeResolver = _interopRequireWildcard(_office);

var _file = require('./resolvers/file.resolver');

var fileResolver = _interopRequireWildcard(_file);

var _graphql = require('../../services/graphql.service');

var _timestamp = require('./scalars/timestamp.scalar');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = {
  Timestamp: _timestamp.timestampScalar,

  CouponBase: {
    __resolveType: function __resolveType(obj) {
      if (obj.campaign) return 'CouponHunted';
      return 'Coupon';
    }
  },

  UserBase: {
    __resolveType: function __resolveType(obj) {
      if (obj.coupons) return 'Hunter';else if (obj.campaigns) return 'Maker';
      return 'User';
    }
  },

  Upload: _apolloUploadServer.GraphQLUpload,

  Query: {
    signIn: userResolver.signIn,
    allUsers: (0, _graphql.requiresAuth)(userResolver.allUsers, ['admin']),
    allMakers: (0, _graphql.requiresAuth)(userResolver.allMakers, ['admin', 'maker']),
    allHunters: (0, _graphql.requiresAuth)(userResolver.allHunters, ['admin', 'maker', 'hunter']),
    getUser: (0, _graphql.requiresAuth)(userResolver.getUser, ['admin']),
    me: (0, _graphql.requiresAuth)(userResolver.me, ['admin', 'maker', 'hunter']),
    //Campaign
    campaign: (0, _graphql.requiresAuth)(campaignResolver.getCampaign, ['maker']),
    allCampaigns: (0, _graphql.requiresAuth)(campaignResolver.allCampaigns, ['hunter']),
    myCampaigns: (0, _graphql.requiresAuth)(campaignResolver.myCampaigns, ['maker']),
    huntersByCampaign: (0, _graphql.requiresAuth)(campaignResolver.getHuntersByCampaign, ['maker']),
    campaignsByMakerId: (0, _graphql.requiresAuth)(campaignResolver.campaignsByMakerId, ['hunter']),
    //Coupon
    couponsFromCampaign: (0, _graphql.requiresAuth)(campaignResolver.getCouponsFromCampaign, ['maker']),
    getCoupon: (0, _graphql.requiresAuth)(couponResolver.getCoupon, ['hunter', 'maker']),
    myCoupons: (0, _graphql.requiresAuth)(userResolver.myCoupons, ['hunter']),
    //Company
    myCompany: (0, _graphql.requiresAuth)(companyResolver.myCompany, ['maker']),
    //Office
    myOffices: (0, _graphql.requiresAuth)(officeResolver.myOffices, ['maker']),
    office: (0, _graphql.requiresAuth)(officeResolver.getOffice, ['maker'])
  },

  Mutation: {
    register: userResolver.register,
    login: userResolver.login,
    signUp: userResolver.signUp,
    updatePassword: (0, _graphql.requiresAuth)(userResolver.updatePassword, ['admin', 'maker', 'hunter']),
    //Campaign
    addCampaign: (0, _graphql.requiresAuth)(campaignResolver.addCampaign, ['maker']),
    updateCampaign: (0, _graphql.requiresAuth)(campaignResolver.updateCampaign, ['maker']),
    deleteCampaign: (0, _graphql.requiresAuth)(campaignResolver.deleteCampaign, ['maker']),
    //Coupon
    captureCoupon: (0, _graphql.requiresAuth)(couponResolver.captureCoupon, ['hunter']),
    //Company
    addCompany: (0, _graphql.requiresAuth)(companyResolver.addCompany, ['maker']),
    //Office
    addOffice: (0, _graphql.requiresAuth)(officeResolver.addOffice, ['maker']),
    //Core uploader
    singleUpload: (0, _graphql.requiresAuth)(fileResolver.uploadFile, ['admin', 'maker', 'hunter']),
    //Core uploader
    addImageToUser: (0, _graphql.requiresAuth)(userResolver.addImageToUser, ['admin', 'maker', 'hunter'])
  }
};
//# sourceMappingURL=resolvers.js.map