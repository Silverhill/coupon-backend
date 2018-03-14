import * as userResolver from './resolvers/user.resolver';
import * as planResolver from './resolvers/plan.resolver';
import * as campaignResolver from './resolvers/campaign.resolver';
import * as couponResolver from './resolvers/coupon.resolver';
import { requiresAuth } from '../../services/graphql.service';

export default {
  Query: {
    allUsers: requiresAuth(userResolver.allUsers),
    allMakers: requiresAuth(userResolver.allMakers, ['maker']),
    allHunters: requiresAuth(userResolver.allHunters, ['maker', 'hunter']),
    getUser: requiresAuth(userResolver.getUser),
    me: requiresAuth(userResolver.me, ['maker', 'hunter']),
    allPlans: requiresAuth(planResolver.allPlans),
    allCampaigns: requiresAuth(campaignResolver.allCampaigns),
    myCampaigns: requiresAuth(campaignResolver.myCampaigns, ['maker']),
    getCoupon: requiresAuth(couponResolver.getCoupon, ['hunter', 'maker']),
  },

  Mutation: {
    register: userResolver.register,
    login: userResolver.login,
    createPlan: requiresAuth(planResolver.createPlan),
    changePassword: requiresAuth(userResolver.changePassword, ['maker', 'hunter']),
  },
}
