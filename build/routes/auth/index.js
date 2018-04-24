'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

var _user = require('../../models/user.model');

var _user2 = _interopRequireDefault(_user);

var _local = require('../../strategies/local');

var _local2 = _interopRequireDefault(_local);

var _facebook = require('../../strategies/facebook');

var _facebook2 = _interopRequireDefault(_facebook);

var _google = require('../../strategies/google');

var _google2 = _interopRequireDefault(_google);

var _twitter = require('../../strategies/twitter');

var _twitter2 = _interopRequireDefault(_twitter);

var _passport = require('../../strategies/local/passport');

var passportLocal = _interopRequireWildcard(_passport);

var _passport2 = require('../../strategies/facebook/passport');

var passportFacebook = _interopRequireWildcard(_passport2);

var _passport3 = require('../../strategies/google/passport');

var passportGoogle = _interopRequireWildcard(_passport3);

var _passport4 = require('../../strategies/twitter/passport');

var passportTwitter = _interopRequireWildcard(_passport4);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();


// Passport Configuration
passportLocal.setup(_user2.default, _config2.default);
passportFacebook.setup(_user2.default, _config2.default);
passportGoogle.setup(_user2.default, _config2.default);
passportTwitter.setup(_user2.default, _config2.default);

router.use('/local', _local2.default);
router.use('/facebook', _facebook2.default);
router.use('/google', _google2.default);
router.use('/twitter', _twitter2.default);

exports.default = router;
//# sourceMappingURL=index.js.map