'use strict';

import express from 'express';
import * as PlanController from '../../controllers/plan.controller';
import * as auth from '../../services/auth.service';

const router = express.Router();

/**
 * @api {post} /plan Create a new plan
 * @apiVersion 1.0.0
 * @apiName  CreateNewPlan
 * @apiGroup Plan
 * @apiParam {Number} quantity Quantity of coupons in plan
 * @apiParam {Number} couponPrice Prince of each coupon
 * @apiParam {String} name Name of plan
 * @apiParam {Number} totalPrice Total price of plan
 * @apiParam {Number} validity Days of duration
 */
router.post('/', auth.hasRole('maker'), PlanController.create);

export default router;
