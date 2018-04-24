'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _user = require('../../controllers/user.controller');

var UserController = _interopRequireWildcard(_user);

var _auth = require('../../services/auth.service');

var auth = _interopRequireWildcard(_auth);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();
/**
 * @api {get} /users Get users
 * @apiVersion 1.0.0
 * @apiName GetUsers
 * @apiGroup User
 */
router.get('/', auth.hasRole('admin'), UserController.index);

/**
 * @api {delete} /users/:id Delete user
 * @apiVersion 1.0.0
 * @apiName DeleteUsers
 * @apiGroup User
 */
router.delete('/:id', auth.hasRole('admin'), UserController.destroy);

/**
 * @api {get} /users/me Get my info
 * @apiVersion 1.0.0
 * @apiName  GetMyInfo
 * @apiGroup User
 */
router.get('/me', auth.isAuthenticated(), UserController.me);

/**
 * @api {put} /users/:id/password Change user password
 * @apiVersion 1.0.0
 * @apiName  ChangePassword
 * @apiGroup User
 */
router.put('/:id/password', auth.isAuthenticated(), UserController.changePassword);

/**
 * @api {get} /users/:id Get a single user
 * @apiVersion 1.0.0
 * @apiName  GetSingleUser
 * @apiGroup User
 */
router.get('/:id', auth.isAuthenticated(), UserController.show);

/**
 * @api {post} /users Create a new user
 * @apiVersion 1.0.0
 * @apiName  CreateNewUser
 * @apiGroup User
 */
router.post('/', UserController.create);

exports.default = router;
//# sourceMappingURL=index.js.map