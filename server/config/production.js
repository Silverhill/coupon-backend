module.exports = {
  facebook:{
    appId: process.env.FBId,
    secret: process.env.FBSecret,
    callbackURL: process.env.FBcallbackURL
  },
  google:{
    appId: process.env.GoogleId,
    secret: process.env.GoogleSecret,
    callbackURL: process.env.GooglecallbackURL
  },
  mailToken: process.env.MailToken,
  secrets: {
    session: process.env.secretSession
  },
  twitter: {
    appId: process.env.TwitterId,
    secret: process.env.TwitterSecret,
    callbackURL: process.env.TwitterCallbackURL
  },
  seedDB: false
};
