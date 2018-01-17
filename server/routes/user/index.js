'use strict';

import express from 'express';
import * as UserController from '../../controllers/user.controller';
import * as auth from '../../services/auth.service';

const router = express.Router();
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

export default router;
