import * as userResolver from './resolvers/user.resolver';
import * as planResolver from './resolvers/plan.resolver';

export default {
  Query: {
    allUsers: userResolver.allUsers,
    allMakers: userResolver.allMakers,
    allHunters: userResolver.allHunters,
    getUser: userResolver.getUser,
    me: userResolver.me,
    allPlans: planResolver.allPlans,
  },

  Mutation: {
    register: userResolver.register,
    login: userResolver.login,
    createPlan: planResolver.createPlan,
  },
}
