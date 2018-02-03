'use strict';

import Plan from '../models/plan.model';
import * as common from '../services/common.service';

export function create(req, res) {
  var newPlan = new Plan(req.body);
  newPlan.save()
    .then(function(plan) {
      res.json(plan);
    })
    .catch(common.validationError(res));
}
