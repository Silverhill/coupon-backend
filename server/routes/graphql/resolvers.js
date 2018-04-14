import * as userResolver from './resolvers/user.resolver';
import * as campaignResolver from './resolvers/campaign.resolver';
import * as couponResolver from './resolvers/coupon.resolver';
import * as companyResolver from './resolvers/company.resolver';
import * as officeResolver from './resolvers/office.resolver';
import { requiresAuth } from '../../services/graphql.service';
import { timestampScalar } from './scalars/timestamp.scalar'

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
    //Coupon
    couponsFromCampaign: requiresAuth(campaignResolver.getCouponsFromCampaign, ['maker']),
    getCoupon: requiresAuth(couponResolver.getCoupon, ['hunter', 'maker']),
    //Company
    myCompany: requiresAuth(companyResolver.myCompany, ['maker']),
    //Office
    myOffices: requiresAuth(officeResolver.myOffices, ['maker']),
    myCoupons: requiresAuth(userResolver.myCoupons, ['hunter']),
  },

  Mutation: {
    register: userResolver.register,
    login: userResolver.login,
    signUp: userResolver.signUp,
    updatePassword: requiresAuth(userResolver.updatePassword, ['admin', 'maker', 'hunter']),
    //Campaign
    addCampaign: requiresAuth(campaignResolver.addCampaign, ['maker']),
    updateCampaign: requiresAuth(campaignResolver.updateCampaign, ['maker']),
    deleteCampaign: requiresAuth(campaignResolver.deleteCampaign, ['maker']),
    //Coupon
    captureCoupon: requiresAuth(couponResolver.captureCoupon, ['hunter']),
    //Company
    addCompany: requiresAuth(companyResolver.addCompany, ['maker']),
    //Office
    addOffice: requiresAuth(officeResolver.addOffice, ['maker'])
  }
}
