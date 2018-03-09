import { requiresAuth } from '../../../services/graphql.service';

/**
 * Plan Resolvers
 * @param {object} parent Data from the parent
 * @param {object} args get all arguments passed in the query
 * @param {object} context get request and models from the graphql schema
 */
export const createPlan = requiresAuth(async (parent, args, context) => {
  const { models } = context;
  const { plan } = args;

  const newPlan = await new models.Plan(plan);
  newPlan.save();

  return newPlan;
});

export const allPlans = requiresAuth(async (parent, args, context) => {
  const { models } = context;
  const plans = await models.Plan.find();

  return plans;
});
