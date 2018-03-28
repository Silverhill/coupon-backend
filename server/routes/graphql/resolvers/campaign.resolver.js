import jwt from 'jsonwebtoken';
import config from '../../../config';

export const allCampaigns = async (parent, args, context) => {
  const { models } = context;
  const campaigns = await models.Campaign.find({});

  return campaigns;
};

export const myCampaigns = async (parent, args, { models, request }) => {
  const { headers: { authentication } } = request;
  if(!authentication) throw new Error('You need logged to get campaigns');

  const { _id } = await jwt.verify(authentication, config.secrets.session);
  const { campaigns } = await models.Maker.findOne({ _id });
  return campaigns;
};

export const createCampaign = async (parent, args, { models }) => {
  const newCampaign = await new models.Campaign(args);

  newCampaign.save();

  return newCampaign;
};

export const addCampaign = async (parent, args, context) => {
  const { models } = context;
  const { input } = args;

  const newCampaign = await new models.Campaign(input);

  try {
    await newCampaign.save();
    return newCampaign;
  } catch (error) {
    return error;
  }
}
