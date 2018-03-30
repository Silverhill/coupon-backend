import jwt from 'jsonwebtoken';
import config from '../../../config';

export const allCampaigns = async (parent, args, context) => {
  const { models } = context;
  const campaigns = await models.Campaign.find({});

  return campaigns;
};

export const myCampaigns = async (parent, args, { models, request }) => {
  const { headers: { authentication } } = request;
  if (!authentication) throw new Error('You need logged to get campaigns');

  const { _id } = await jwt.verify(authentication, config.secrets.session);
  const { campaigns } = await models.Maker.findOne({ _id });
  return campaigns;
};

export const addCampaign = async (parent, args, context) => {
  const { models } = context;
  const { input } = args;

  validateRange(input);

  const newCampaign = await new models.Campaign(input);

  try {
    await newCampaign.save();
    return newCampaign;
  } catch (error) {
    return error;
  }
}

export const updateCampaign = async (parent, args, context) => {
  const { models } = context;
  const { input } = args;

  validateRange(input);

  try {
    const updatedCampaign = await models.Campaign.findByIdAndUpdate(input.id,
      input,
      { new: true }
    )
    return updatedCampaign;
  } catch (error) {
    return error;
  }
}

export const deleteCampaign = async (parent, args, context) => {
  const { models } = context;
  const { input: { id } } = args;

  try {
    const updatedCampaign = await models.Campaign.findByIdAndUpdate(id, {
      deleted: true
    }, { new: true });
    return updatedCampaign;
  } catch (error) {
    return error;
  }
}

export const getCampaign = async (parent, args, context) => {
  const { id } = args;
  const { models } = context;
  try {
    const campaign = await models.Campaign.findOne({ _id: id });
    return campaign;
  } catch (error) {
    return error;
  }
};


function validateRange(input) {
  if (input.endAt <= input.startAt) {
    throw new Error('endAt should be greater than startAt.');
  }
  return
}
