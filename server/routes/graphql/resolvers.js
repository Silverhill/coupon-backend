import { GraphQLUpload } from 'apollo-upload-server'

import * as userResolver from './resolvers/user.resolver';
import * as campaignResolver from './resolvers/campaign.resolver';
import * as couponResolver from './resolvers/coupon.resolver';
import * as companyResolver from './resolvers/company.resolver';
import * as officeResolver from './resolvers/office.resolver';
import * as fileResolver from './resolvers/file.resolver';
import * as subscriptionResolver from './resolvers/subscription.resolver'
import { requiresAuth } from '../../services/graphql.service';
import { timestampScalar } from './scalars/timestamp.scalar';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
const params = { pubsub }

export default {
  Timestamp: timestampScalar,

  CouponBase: {
    __resolveType(obj){
      if(obj.campaign) return 'CouponHunted';
      return 'Coupon';
    }
  },

  UserBase: {
    __resolveType(obj){
      if(obj.coupons) return 'Hunter';
      else if(obj.campaigns) return 'Maker';
      return 'User';
    }
  },

  Upload: GraphQLUpload,

  Query: {
    signIn: userResolver.signIn,
    allUsers: requiresAuth(userResolver.allUsers, ['admin']),
    allMakers: requiresAuth(userResolver.allMakers, ['admin', 'maker']),
    allHunters: requiresAuth(userResolver.allHunters, ['admin', 'maker', 'hunter']),
    getUser: requiresAuth(userResolver.getUser, ['admin']),
    me: requiresAuth(userResolver.me, ['admin', 'maker', 'hunter']),
    //Campaign
    campaign: requiresAuth(campaignResolver.getCampaign, ['maker']),
    allCampaigns: requiresAuth(campaignResolver.allCampaigns, ['hunter']),
    myCampaigns: requiresAuth(campaignResolver.myCampaigns, ['maker']),
    huntersByCampaign: requiresAuth(campaignResolver.getHuntersByCampaign, ['maker']),
    campaignsByMakerId: requiresAuth(campaignResolver.campaignsByMakerId, ['hunter']),
    huntedCouponsByCampaign: requiresAuth(campaignResolver.getHuntedCouponsByCampaign, ['maker']),
    //Coupon
    couponsFromCampaign: requiresAuth(campaignResolver.getCouponsFromCampaign, ['maker']),
    getCoupon: requiresAuth(couponResolver.getCoupon, ['hunter', 'maker']),
    myCoupons: requiresAuth(userResolver.myCoupons, ['hunter']),
    myRedeemedCoupons: requiresAuth(userResolver.myRedeemedCoupons, ['hunter']),
    //Company
    myCompany: requiresAuth(companyResolver.myCompany, ['maker']),
    myHunters: requiresAuth(companyResolver.myHunters, ['maker']),
    //Office
    myOffices: requiresAuth(officeResolver.myOffices, ['maker']),
    office: requiresAuth(officeResolver.getOffice, ['maker'])
  },

  Mutation: {
    register: userResolver.register,
    login: userResolver.login,
    signUp: userResolver.signUp,
    //User
    updatePassword: requiresAuth(userResolver.updatePassword, ['admin', 'maker', 'hunter']),
    updateUser: requiresAuth(userResolver.updateUser, ['maker', 'hunter']),
    //Campaign
    addCampaign: requiresAuth(campaignResolver.addCampaign, ['maker'], params),
    updateCampaign: requiresAuth(campaignResolver.updateCampaign, ['maker']),
    deleteCampaign: requiresAuth(campaignResolver.deleteCampaign, ['maker']),
    //Coupon
    captureCoupon: requiresAuth(couponResolver.captureCoupon, ['hunter'], params),
    redeemCoupon: requiresAuth(couponResolver.redeemCoupon, ['maker'], params),
    //Company
    addCompany: requiresAuth(companyResolver.addCompany, ['maker']),
    addImageToCompany: requiresAuth(companyResolver.addImageToCompany, ['maker']),
    updateCompany: requiresAuth(companyResolver.updateCompany, ['maker']),
    //Office
    addOffice: requiresAuth(officeResolver.addOffice, ['maker']),
    //Core uploader
    singleUpload: requiresAuth(fileResolver.uploadFile, ['admin', 'maker', 'hunter']),
    //Core uploader
    addImageToUser: requiresAuth(userResolver.addImageToUser, ['admin', 'maker', 'hunter']),
  },
  Subscription: {
    redeemedCoupon:  subscriptionResolver.redeemedCoupon(params),
    expiredCampaign: subscriptionResolver.expiredCampaign(params),
    huntedCoupon: subscriptionResolver.huntedCoupon(params)
  }
}
