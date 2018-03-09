import * as userResolver from './resolvers/user.resolver';

export default {
  Query: {
    allUsers: userResolver.allUsers,
    allMakers: userResolver.allMakers,
    allHunters: userResolver.allHunters,
    getUser: userResolver.getUser,
    me: userResolver.me,
  },

  Mutation: {
    register: userResolver.register,
    login: userResolver.login
  },
}
