'use strict';

var _module$exports;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

module.exports = (_module$exports = {
  facebook: {
    appId: process.env.FBId,
    secret: process.env.FBSecret,
    callbackURL: process.env.FBcallbackURL
  },
  google: {
    appId: process.env.GoogleId,
    secret: process.env.GoogleSecret,
    callbackURL: process.env.GooglecallbackURL
  },
  mailToken: process.env.MailToken,
  secrets: {
    session: process.env.secretSession
  }
}, _defineProperty(_module$exports, 'secrets', {
  session: 'backend-secret'
}), _defineProperty(_module$exports, 'twitter', {
  appId: process.env.TwitterId,
  secret: process.env.TwitterSecret,
  callbackURL: process.env.TwitterCallbackURL
}), _defineProperty(_module$exports, 'mongoUrl', process.env.MONGO_URL), _defineProperty(_module$exports, 'seedDB', false), _module$exports);
//# sourceMappingURL=production.js.map