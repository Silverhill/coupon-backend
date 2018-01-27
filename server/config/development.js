module.exports = {
  facebook:{
    appId: '302305353609153',
    secret: '2632322f05241cb2d07fa31765e3c5d4',
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  },
  google:{
    appId: '705966156450-mq8j847ugrl37jk4jraggf279qvi4qil.apps.googleusercontent.com',
    secret: 'VInnQimkPxfurIeBGWY0m6V4',
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  mailToken: 'dfksaldjfklsajfdklasddkfjas',
  secrets: {
    session: 'backend-secret'
  },
  twitter: {
    appId: 'L1Xoi0yaENMepWuh0mKVUWMWU',
    secret: 'gn44gkPT8W8JeVjWVgFtq8cEBXYT7qxFYBo24iYnAK2Tm5Zfka',
    callbackURL: 'http://localhost:3000/auth/twitter/callback'
  },
  seedDB: true
};
