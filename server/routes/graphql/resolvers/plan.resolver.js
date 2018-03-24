export const addPlan = async (parent, args, context) => {
  const { models } = context;
  const { input } = args;

  const newPlan = await new models.Plan(input);

  try {
    await newPlan.save();
    return newPlan;
  } catch (err) {
    return err;
  }
};

export const allPlans = async (parent, args, context) => {
  const { models } = context;
  const plans = await models.Plan.find();

  return plans;
};
