'use strict';

import express from 'express';
import * as PlanController from '../../controllers/plan.controller';
import * as auth from '../../services/auth.service';

const router = express.Router();

/**
 * @api {post} /plans Create a new plan
 * @apiVersion 1.0.0
 * @apiName  CreateNewPlan
 * @apiGroup Plan
 * @apiParam {Number} quantity Quantity of coupons in plan
 * @apiParam {Number} couponPrice Prince of each coupon
 * @apiParam {String} name Name of plan
 * @apiParam {Number} totalPrice Total price of plan
 * @apiParam {Number} validity Days of duration
 */
router.post('/', auth.hasRole('admin'), PlanController.create);

/**
 * @api {put} /plans/:planId Update plan
 * @apiVersion 1.0.0
 * @apiName  UpdatePlan
 * @apiGroup Plan
 * @apiParam {Number} planId Plan Id
 * @apiParam {Number} quantity Quantity of coupons in plan
 * @apiParam {Number} couponPrice Prince of each coupon
 * @apiParam {String} name Name of plan
 * @apiParam {Number} totalPrice Total price of plan
 * @apiParam {Number} validity Days of duration
 */
router.put('/:planId', auth.hasRole('admin'), PlanController.update);

/**
 * @api {delete} /plans/:planId Delete plan
 * @apiVersion 1.0.0
 * @apiName  DeletePlan
 * @apiGroup Plan
 * @apiParam {Number} planId Plan Id
 */
router.delete('/:planId', auth.hasRole('admin'), PlanController.deletePlan);

/**
 * @api {get} /plans Get all plans
 * @apiVersion 1.0.0
 * @apiName  GetPlans
 * @apiGroup Plan
 */
router.get('/', auth.hasRole('admin'), PlanController.getAll);

/**
 * @api {get} /plans/:planId Get a single plan
 * @apiVersion 1.0.0
 * @apiName  GetPlan
 * @apiGroup Plan
 * @apiParam {Number} planId Plan Id
 */
router.get('/:planId', auth.hasRole('admin'), PlanController.find)

export default router;
