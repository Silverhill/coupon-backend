import jwt from 'jsonwebtoken';
import fs from 'fs';
import cloudinary from 'cloudinary';
import config from '../../../config';
import crypto from 'crypto';
import _ from 'lodash'
import { extractUserIdFromToken } from '../../../services/model.service';
import { storeFile } from './file.resolver';

export const allCampaigns = async (parent, {
                                            limit = 10,
                                            skip = 0,
                                            sortField = 'createdAt',
                                            sortDirection = 1
                                          }, context) => {
  const { models, request } = context;

  const sortObject = {};
  sortObject[sortField] = sortDirection;
  const { headers: { authentication } } = request;
  const hunterId = await extractUserIdFromToken(authentication);

  const hunter = await models.Hunter
    .findOne({_id: hunterId})
    .populate('coupons')

  const mycampaigns = await models.Campaign
    .find({
      coupons: { '$in': hunter.coupons }
    })
    .populate('coupons')

  const numberOfHuntedCoupons = getCampaignsWithHuntedCoupons(mycampaigns, hunter.coupons);

  const total = await models.Campaign.count({});

  const campaigns = await models.Campaign.find({})
    .limit(limit)
    .skip(skip)
    .sort(sortObject)
    .populate('coupons')
    .populate('maker');

  const campaignsWithDetails = addCouponsHuntedByMe(campaigns, mycampaigns, numberOfHuntedCoupons)

  const returnObject = {
    campaigns: campaignsWithDetails,
    totalCount: total
  }
  return returnObject;
};

export const myCampaigns = async (parent, args, { models, request }) => {
  const { headers: { authentication } } = request;
  if (!authentication) throw new Error('You need logged to get campaigns');

  const { _id } = await jwt.verify(authentication, config.secrets.session);
  const campaigns = await models.Campaign.find({ maker: _id },  '-coupons')
    .populate('office');

  return campaigns;
};

// TODO: Actualizar el estado (status) de la campaña acorde a las necesidades
export const addCampaign = async (parent, args, context) => {
  const { models, request } = context;
  const { input } = args;
  const { headers: { authentication } } = request;
  validateRange(input);
  const makerId = await extractUserIdFromToken(authentication);
  const office = await getOffice(makerId, input.officeId, models);
  if (!office) {
    throw Error('Invalid office Id');
  }

  const { couponsNumber } = input;
  const campaign = {
    ...input,
    age: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
    totalCoupons: couponsNumber,
    maker: makerId,
    office: office._id
  }

  if(campaign.upload){
    const { stream, filename } = await campaign.upload;
    const { path } = await storeFile({ stream, filename });
    await cloudinary.v2.uploader.upload(path, (error, result) => {
      if (result) {
        campaign.image = result.url;
        fs.unlinkSync(path);
      } else if (error) {
        return error;
      }
    });
  }

  const newCampaign = await new models.Campaign(campaign);

  try {
    await newCampaign.save();
    const { _id: campaignId } = newCampaign;
    await addCouponsToCampaign(couponsNumber, campaignId, models)
    await updateRelatedModels({
      officeId: office._id,
      campaignId,
      models,
      makerId
    });
    const campaignUpdated = await models.Campaign
      .findOne({ _id: campaignId },  '-coupons')
      .populate('office');
    return campaignUpdated;
  } catch (error) {
    newCampaign.remove();
    throw new Error(error.message || error);
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
    throw new Error(error.message || error);
  }
}

export const deleteCampaign = async (parent, args, context) => {
  const { models } = context;
  const { input: { id } } = args;

  try {

    const campaign = await models.Campaign.findOne({ _id: id });

    if (campaign.huntedCoupons == 0) {
      const updatedCampaign = await models.Campaign.findByIdAndUpdate(id, {
        deleted: true,
        updatedAt: new Date()
      }, { new: true });

      return updatedCampaign;

    } else {
      throw new Error('This campaign can not be deleted because there are coupons hunted.');
    }

  } catch (error) {
    throw new Error(error.message || error);
  }
}

export const getCampaign = async (parent, args, context) => {
  const { id } = args;
  const { models } = context;
  try {
    const campaign = await models.Campaign.findOne({ _id: id });
    return campaign;
  } catch (error) {
    throw new Error(error.message || error);
  }
};

export const getCouponsFromCampaign = async (parent, args, context) => {
  const { campaignId } = args;
  const { models } = context;
  try {
    const { coupons } = await models.Campaign.findOne({ _id: campaignId })
      .populate('coupons')
      .exec();
    return coupons;
  } catch (error) {
    throw new Error(error.message || error);
  }
};

export const getHuntersByCampaign = async (parent, args, context) => {
  const { campaignId } = args;
  const { models, request } = context;
  const { headers: { authentication } } = request;
  const makerId = await extractUserIdFromToken(authentication);

  try {

    const campaign = await models.Campaign.findOne({
      _id: campaignId,
      maker: makerId
    }).populate({
      path: 'coupons',
      match: {
        hunter: {'$exists': true}
      }
    });

    const coupons = await models.Coupon.find({
      _id: { '$in': campaign.coupons }
    })
    .populate('hunter')

    const hunters = coupons.map(item => item.hunter)

    return hunters;
  } catch (error) {
    throw new Error(error.message || error);
  }
};

export const campaignsByMakerId = async(parent, { makerId }, { models }) => {
  try {
    const campaigns = await models.Campaign.find({ maker: makerId }, '-coupons');
    return campaigns;
  } catch (error) {
    throw new Error('Maker id not exist');
  }
}

function validateRange(input) {
  if (input.endAt <= input.startAt) {
    throw new Error('endAt should be greater than startAt.');
  }
  return
}

async function addCouponsToCampaign(quantity, campaignId, models) {
  await createCouponsRecursively(quantity, models, campaignId);
}

async function createCouponsRecursively(maxQuantity, models, campaignId) {
  if (maxQuantity > 0) {
    const code = crypto.randomBytes(10).toString('hex')
    const coupon = {
      code,
      status: 'available',
      createdAt: new Date(),
      updatedAt: new Date(),
      campaign: campaignId
    }
    try {
      const newCoupon = await new models.Coupon(coupon);
      await newCoupon.save();

      await models.Campaign.findByIdAndUpdate(campaignId,
        {
          '$push': { 'coupons': newCoupon._id },
          updatedAt: new Date()
        },
        { new: true }
      );

      maxQuantity = maxQuantity - 1;
      await createCouponsRecursively(maxQuantity, models, campaignId);

    } catch (error) {
      throw new Error(error.message || error);
    }
  }
}

async function getOffice(makerId, officeId, models) {
  const company = await models.Company.findOne({ maker: makerId });
  const office = await models.Office.findOne({
    _id: officeId,
    company: company._id
  });
  return office;
}

function addCampaignToOffice(officeId, campaignId, models) {
  return models.Office.findByIdAndUpdate(officeId,
    {
      '$push': { 'campaigns': campaignId },
      updatedAt: new Date()
    },
    { new: true }
  );
}

function addCampaignsToMaker(makerId, campaignId, models){
  return models.Maker.findByIdAndUpdate(makerId,
    {
      '$push': { 'campaigns': campaignId },
      updatedAt: new Date()
    },
    { new: true }
  );
}

function findHuntedCampaign(campaignId, mycampaigns) {
  return mycampaigns.find(mycampaign => {
    return mycampaign.id === campaignId;
  });
}

function getCampaignsWithHuntedCoupons(mycampaigns, hunterCoupons) {
  let data = {};
  for(let i = 0; i < mycampaigns.length; i++) {
    const campaign = mycampaigns[i];
    const mycoupons = _.intersectionBy(campaign.coupons, hunterCoupons, 'id');
    data[campaign.id] = mycoupons.length;
  }
  return data;
}

function addCouponsHuntedByMe(campaigns, mycampaigns, numberOfHuntedCoupons) {
  let result = [];
  for (let i = 0; i < campaigns.length; i++) {
    let campaign = campaigns[i];
    const isMyCampaign = findHuntedCampaign(campaign.id, mycampaigns);
    if (isMyCampaign) {
      campaign.couponsHuntedByMe =  numberOfHuntedCoupons[campaign.id];
    } else {
      campaign.couponsHuntedByMe = 0;
    }
    result.push(campaign);
  }
  return result;
}

function updateRelatedModels(params) {
  const {
    officeId,
    campaignId,
    models,
    makerId
  } = params;
  const promiseCampaignToOffice = addCampaignToOffice(officeId, campaignId, models)
  const promiseCampaignsToMaker = addCampaignsToMaker(makerId, campaignId, models)
  return Promise.all([promiseCampaignToOffice, promiseCampaignsToMaker])
}
