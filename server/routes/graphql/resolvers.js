import * as userResolver from './resolvers/user.resolver';
import * as campaignResolver from './resolvers/campaign.resolver';
import * as couponResolver from './resolvers/coupon.resolver';
import { requiresAuth } from '../../services/graphql.service';
import { timestampScalar } from './scalars/timestamp.scalar'

export default {
  Timestamp: timestampScalar,

  Query: {
    signIn: userResolver.signIn,
    allUsers: requiresAuth(userResolver.allUsers),
    allMakers: requiresAuth(userResolver.allMakers, ['maker']),
    allHunters: requiresAuth(userResolver.allHunters, ['maker', 'hunter']),
    getUser: requiresAuth(userResolver.getUser),
    me: requiresAuth(userResolver.me, ['maker', 'hunter']),
    campaign: requiresAuth(campaignResolver.getCampaign, ['maker']),
    allCampaigns: requiresAuth(campaignResolver.allCampaigns),
    myCampaigns: requiresAuth(campaignResolver.myCampaigns, ['maker']),
    getCoupon: requiresAuth(couponResolver.getCoupon, ['hunter', 'maker']),
  },

  Mutation: {
    register: userResolver.register,
    login: userResolver.login,
    signUp: userResolver.signUp,
    updatePassword: requiresAuth(userResolver.updatePassword, ['maker', 'hunter']),
    addCampaign: requiresAuth(campaignResolver.addCampaign, ['maker']),
    updateCampaign: requiresAuth(campaignResolver.updateCampaign, ['maker']),
    deleteCampaign: requiresAuth(campaignResolver.deleteCampaign, ['maker'])
  },
}
