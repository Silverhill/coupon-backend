export const createPlan = async (parent, args, context) => {
  const { models } = context;
  const { plan } = args;

  const newPlan = await new models.Plan(plan);
  newPlan.save();

  return newPlan;
};

export const allPlans = async (parent, args, context) => {
  const { models } = context;
  const plans = await models.Plan.find();

  return plans;
};
