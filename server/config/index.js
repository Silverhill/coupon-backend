export default {
  facebook:{
    appId: process.env.FBId ||'302305353609153',
    secret: process.env.FBSecret ||'2632322f05241cb2d07fa31765e3c5d4',
    callbackURL: process.env.FBcallbackURL ||'http://localhost:3000/auth/facebook/callback'
  },
  google:{
    appId: process.env.GoogleId ||'705966156450-mq8j847ugrl37jk4jraggf279qvi4qil.apps.googleusercontent.com',
    secret: process.env.GoogleSecret ||'VInnQimkPxfurIeBGWY0m6V4',
    callbackURL: process.env.GooglecallbackURL ||'http://localhost:3000/auth/google/callback'
  },
  twitter: {
    appId: process.env.TwitterId || 'L1Xoi0yaENMepWuh0mKVUWMWU',
    secret: process.env.TwitterSecret || 'gn44gkPT8W8JeVjWVgFtq8cEBXYT7qxFYBo24iYnAK2Tm5Zfka',
    callbackURL: process.env.TwittercallbackURL || 'http://localhost:3000/auth/twitter/callback'
  },
  mailToken: process.env.MailToken ||'dfksaldjfklsajfdklasddkfjas',
  secrets: {
    session: process.env.secretSession ||'backend-secret'
  },
  userRoles: ['user', 'admin']
}
