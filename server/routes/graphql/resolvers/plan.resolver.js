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

export const getPlan = async (parent, args, context) => {
  const { id } = args;
  const { models } = context;
  const plan = await models.Plan.findOne({ _id: id });
  return plan;
};

export const updatePlan = async (parent, args, context) => {
  const { input } = args;
  const { models } = context;
  try {
    const plan = await models.Plan.findByIdAndUpdate(input.id, input, { new: true })
    return plan;
  } catch (error) {
    return error;
  }
};

export const deletePlan = async (parent, args, context) => {
  const { input: { id } } = args;
  const { models } = context;
  try {
    const plan = await models.Plan.findByIdAndUpdate(id, {
      deleted: true
    }, { new: true })
    return plan;
  } catch (error) {
    return error;
  }
};
