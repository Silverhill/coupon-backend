'use strict';

import Plan from '../models/plan.model';
import * as common from '../services/common.service';

export function create(req, res) {
  var newPlan = new Plan(req.body);
  newPlan.save()
    .then((plan) => {
      res.status(201).json(plan);
    })
    .catch(common.validationError(res));
}

export function update(req, res) {
  const planId = req.params.planId;
  Plan.findByIdAndUpdate(planId, req.body, {new: true})
    .exec()
    .then((plan) => {
      if(!plan) {
        return res.status(404).end();
      }
      res.status(201).json(plan);
    })
    .catch(common.validationError(res));
}

export function deletePlan(req, res) {
  const planId = req.params.planId;
  Plan.findByIdAndUpdate(planId, {
      deleted: true
    }, {new: true})
    .exec()
    .then((plan) => {
      if(!plan) {
        return res.status(404).end();
      }
      res.status(200).json(plan);
    })
    .catch(common.validationError(res));
}

export function getAll(req, res) {
  Plan.find({})
    .exec()
    .then(plans => {
      if(!plans) {
        return res.status(404).end();
      }
      res.status(200).json(plans);
    })
    .catch(common.validationError(res));
}

export function find(req, res) {
  const planId = req.params.planId;
  Plan.findById(planId)
    .exec()
    .then(plan => {
      if(!plan) {
        return res.status(404).end();
      }
      res.status(200).json(plan);
    })
    .catch(common.validationError(res));
}
