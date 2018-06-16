import User from '../../server/models/user.model';
import AppSetting from '../../server/models/appSetting.model'

const utils = {
  async callToQraphql(request, query, token) {
    let post = null;
    if (token) {
      post = await request.post('/graphql')
        .set('Accept', 'application/json')
        .set('authentication', `${token}`)
        .send(query)
    } else {
      post = await request.post('/graphql')
        .set('Accept', 'application/json')
        .send(query)
    }

    return post;
  },

  async createDefaultUsers() {
    await User.create({
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin'
    })
    await User.create({
      provider: 'local',
      role: 'hunter',
      name: 'Hunter',
      email: 'hunter@example.com',
      password: 'hunter'
    })
    await User.create({
      provider: 'local',
      role: 'hunter',
      name: 'Hunter2',
      email: 'hunter2@example.com',
      password: 'hunter'
    })
    await User.create({
      provider: 'local',
      role: 'hunter',
      name: 'Hunter3',
      email: 'hunter3@example.com',
      password: 'hunter'
    })
    await User.create({
      provider: 'local',
      role: 'maker',
      name: 'Maker',
      email: 'maker@example.com',
      password: 'maker'
    })
  },

  async createDefaultSetting() {
    await AppSetting.create({
      scoreRedeemCoupon: 1
    });
  },

  getAdminLoginQuery() {
    return {
      query: `
        {
          signIn(email: "admin@example.com", password: "admin") {
            token
          }
        }
      `
    };
  },

  getHunterLoginQuery() {
    return {
      query: `
        {
          signIn(email: "hunter@example.com", password: "hunter") {
            token
          }
        }
      `
    };
  },


  getHunterLoginQuery2() {
    return {
      query: `
        {
          signIn(email: "hunter2@example.com", password: "hunter") {
            token
          }
        }
      `
    };
  },

  getHunterLoginQuery3() {
    return {
      query: `
        {
          signIn(email: "hunter3@example.com", password: "hunter") {
            token
          }
        }
      `
    };
  },

  getMakerLoginQuery() {
    return {
      query: `
        {
          signIn(email: "maker@example.com", password: "maker") {
            token
          }
        }
      `
    };
  }
}

export default utils;


