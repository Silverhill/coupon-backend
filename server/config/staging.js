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
  cloudinary:{
    cloud_name: process.env.cloudName,
    api_key: process.env.cloudinaryKey,
    api_secret: process.env.cloudinarySecret
  },
  mongoUrl: process.env.MONGO_URL,
  seedDB: true,
  port: process.env.PORT,
};
