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
  const { campaigns } = await models.Maker.findOne({ _id })
                                          .populate('campaigns')
                                          .exec();

  return campaigns;
};

export const addCampaign = async (parent, args, context) => {
  const { models, request } = context;
  const { input } = args;
  const { headers: { authentication } } = request;
  validateRange(input);
  const makerId = await extractUserIdFromToken(authentication);
  const { couponsNumber } = input;
  const campaign = {
    ...input,
    age: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
    totalCoupons: couponsNumber,
    maker: makerId
  }

  const newCampaign = await new models.Campaign(campaign);

  try {
    await newCampaign.save();
  } catch (error) {
    return error;
  }

  try {
    await models.Maker.findByIdAndUpdate(makerId,
      { "$push": { "campaigns": newCampaign._id } },
      { new: true }
    );
    return newCampaign;
  } catch (error) {
    newCampaign.remove();
    return error;
  }
}

export const updateCampaign = async (parent, args, context) => {
  const { models } = context;
  const { input } = args;

  validateRange(input);

  try {
    const campaign = {
      ...input,
      updatedAt: new Date()
    }
    const updatedCampaign = await models.Campaign.findByIdAndUpdate(input.id,
      campaign,
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
      deleted: true,
      updatedAt: new Date()
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

async function extractUserIdFromToken(token) {
  try {
    const { _id } = await jwt.verify(token, config.secrets.session);
    return _id;
  } catch (error) {
    return null;
  }
}
