import fs from 'fs';
import cloudinary from 'cloudinary';
import config from '../../../config';
import _ from 'lodash'
import { storeFile, validateImage } from './file.resolver';
import schedule from 'node-schedule'

export const allCampaigns = async (parent, {
                                            limit = 10,
                                            skip = 0,
                                            sortField = 'createdAt',
                                            sortDirection = 1,
                                            ...args
                                          }, context) => {
  const { models } = context;

  const sortObject = {};
  sortObject[sortField] = sortDirection;
  const {_id: hunterId} = args.currentUser;

  const myCoupons = await getHunterCoupons(models, hunterId);
  const campaignsSelectedByMe = await getCampaignsSelectedByMe(models, myCoupons);
  const campaignsWithCouponsSelected = mapCampaignsWithTotalOfCouponsHuntedByMe(campaignsSelectedByMe, myCoupons);
  const total = await models.Campaign.count({});
  const getCampaigns = models.Campaign.find({});
  if(limit) getCampaigns.limit(limit);
  if(skip) getCampaigns.skip(skip);

  const allSortedCampaigns = await getCampaigns
    .sort(sortObject)
    .populate('coupons')
    .populate('maker');

  const campaignsWithDetails = addCouponsHuntedByMeToCampaigns(allSortedCampaigns, campaignsSelectedByMe, campaignsWithCouponsSelected)
  const returnObject = {
    campaigns: campaignsWithDetails,
    totalCount: total
  }
  return returnObject;
};

export const myCampaigns = async (parent, {
                                            limit = 10,
                                            skip = 0,
                                            sortField = 'createdAt',
                                            sortDirection = 1,
                                            ...args
                                          }, { models }) => {
  const sortObject = {};
  sortObject[sortField] = sortDirection;


  const { _id } = args.currentUser;
  const total = await models.Campaign.count({ maker: _id });
  const campaigns = await models.Campaign.find({ maker: _id },  '-coupons')
    .limit(limit)
    .skip(skip)
    .sort(sortObject)
    .populate('office');

  const returnObject = {
    campaigns: campaigns,
    totalCount: total
  }

  return returnObject;
};

export const myInactiveCampaigns = async (parent, {
    limit = 10,
    skip = 0,
    sortField = 'createdAt',
    sortDirection = 1,
    ...args
  }, { models }) => {
  const sortObject = {};
  sortObject[sortField] = sortDirection;


  const { _id } = args.currentUser;
  const total = await models.Campaign.count({ maker: _id, endAt: {'$lte': new Date()} });
  const campaigns = await models.Campaign.find({ maker: _id, endAt: {'$lte': new Date()} },  '-coupons')
  .limit(limit)
  .skip(skip)
  .sort(sortObject)
  .populate('office');

  const returnObject = {
  campaigns: campaigns,
  totalCount: total
  }

  return returnObject;
};

export const addCampaign = async (parent, args, context) => {
  const { models, params } = context;
  const { pubsub } = params;
  const { input } = args;
  const {_id: makerId} = args.currentUser;
  const office = await getOffice(makerId, input.officeId, models);
  if (!office) {
    throw Error('Invalid office Id');
  }

  const { couponsNumber } = input;
  const campaign = {
    totalCoupons: couponsNumber,
    initialAgeRange: 18,
    finalAgeRange: 60,
    maker: makerId,
    office: office._id,
    ...input
  }

  if(campaign.upload){
    const { stream, filename } = await campaign.upload;
    const { path } = await storeFile({ stream, filename });
    validateImage(filename, path);
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
    await updateRelatedModels({
      officeId: office._id,
      campaignId,
      models,
      makerId
    });
    const campaignUpdated = await models.Campaign
      .findOne({ _id: campaignId },  '-coupons')
      .populate('office');

    const task = schedule.scheduleJob(campaignUpdated.endAt, async () => {
      const expiredCampaign = await models.Campaign.findOneAndUpdate({_id: campaignUpdated.id }, {
        $set: {
          expired: true
        },
      },
      { new: true});

      if (makerId) {
        notifyExpiredCampaignToMaker(pubsub, makerId, expiredCampaign);
      }

      task.cancel();
    });

    return campaignUpdated;
  } catch (error) {
    newCampaign.remove();
    throw new Error(error.message || error);
  }
}

export const updateCampaign = async (parent, args, context) => {
  const { models } = context;
  const { input } = args;

  try {
    const campaign = {
      ...input
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
  const { input: { id } } = args || {};

  try {

    const campaign = await models.Campaign.findOne({ _id: id });

    if (campaign.huntedCoupons == 0) {
      const updatedCampaign = await models.Campaign.findByIdAndUpdate(id, {
        deleted: true
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
    const campaign = await models.Campaign.findOne({ _id: id })
                                          .populate('office');

    return campaign;
  } catch (error) {
    throw new Error(error.message || error);
  }
};

//deprecated
export const getCouponsFromCampaign = async (parent, args, context) => {
  const { campaignId } = args;
  const { models } = context;
  try {
    const campaign = await models.Campaign
      .findOne({ _id: campaignId })
      .populate('coupons') || {}

    return campaign.coupons || [];
  } catch (error) {
    throw new Error(error.message || error);
  }
};

export const getHuntedCouponsByCampaign = async (parent, args, context) => {
  const { campaignId } = args;
  const { models } = context;
  try {
    const campaign = await models.Campaign.findOne({
        _id: campaignId
      })
      .populate({
        path: 'coupons',
        match: {
          status: config.couponStatus.HUNTED
        }
      }) || {};
    return campaign.coupons || [];
  } catch (error) {
    throw new Error(error.message || error);
  }
};

export const getCouponsByCampaignAndHunter = async (parent, args, context) => {
  const { campaignId, hunterId } = args;
  const { models } = context;
  try {
    const campaign = await models.Campaign.findOne({
        _id: campaignId
      })
      .populate({
        path: 'coupons',
        match:{
          hunter: hunterId
        }
      }) || {};
    return campaign.coupons || [];
  } catch (error) {
    throw new Error(error.message || error);
  }
}

export const getHuntersByCampaign = async (parent, args, context) => {
  const { campaignId } = args;
  const { models } = context;
  const {_id: makerId} = args.currentUser;

  try {

    const campaign = await models.Campaign.findOne({
      _id: campaignId,
      maker: makerId
    }).populate({
      path: 'coupons',
      match: {
        hunter: {'$exists': true}
      }
    }) || {};

    const coupons = await models.Coupon.find({
      _id: { '$in': campaign.coupons || [] }
    })
    .populate('hunter');

    let hunters = [];
    for(let i = 0; i < coupons.length; i++){
      const index = hunters.indexOf(coupons[i].hunter);
      if(index>-1){
        hunters[index].couponsInCampaign +=1;
      }else{
        coupons[i].hunter.couponsInCampaign = 1;
        hunters.push(coupons[i].hunter);
      }
    }

    return hunters;
  } catch (error) {
    throw new Error(error.message || error);
  }
};

export const campaignsByMakerId = async(parent, args, { models }) => {
  const {currentUser, makerId} = args;
  const {_id: hunterId} = currentUser;
  let makerCampaigns = [];

  try {
    makerCampaigns = await models.Campaign
                                .find({
                                  maker: makerId
                                })
                                .select('-coupons')
                                .populate('maker') || [];
  } catch (error) {
    throw new Error('Maker id not exist');
  }

  const myCoupons = await getHunterCoupons(models, hunterId);
  const campaignsSelectedByMe = await getCampaignsSelectedByMe(models, myCoupons);
  const campaignsWithCouponsSelected = mapCampaignsWithTotalOfCouponsHuntedByMe(campaignsSelectedByMe, myCoupons);
  const campaignsWithDetails = addCouponsHuntedByMeToCampaigns(makerCampaigns, campaignsSelectedByMe, campaignsWithCouponsSelected)

  return campaignsWithDetails;
}

export const getPublicCampaigns = async (parent, {
                                                    limit = 10,
                                                    skip = 0,
                                                    sortField = 'createdAt',
                                                    sortDirection = 1
                                                  }, { models }) => {

  const sortObject = {};
  sortObject[sortField] = sortDirection;
  const totalCount = await models.Campaign.count({});
  const getCampaigns = models.Campaign.find({});
  if(limit) getCampaigns.limit(limit);
  if(skip) getCampaigns.skip(skip);

  const sortedCampaigns = await getCampaigns
    .sort(sortObject)
    .select('-coupons -maker')
    .populate({
      path: 'office',
      select: '-ruc',
      populate: {
        path: 'company',
        select: '-offices -campaigns',
      }
    })

  const paginatedPublicCampaigns = {
    campaigns: sortedCampaigns,
    totalCount: totalCount
  }
  return paginatedPublicCampaigns;
}

async function getOffice(makerId, officeId, models) {
  const company = await models.Company.findOne({ maker: makerId }) || {};
  const office = await models.Office.findOne({
    _id: officeId,
    company: company._id
  });
  return office;
}

function addCampaignToOffice(officeId, campaignId, models) {
  return models.Office.findByIdAndUpdate(officeId,
    {
      '$push': { 'campaigns': campaignId }
    },
    { new: true }
  );
}

function addCampaignsToMaker(makerId, campaignId, models){
  return models.Maker.findByIdAndUpdate(makerId,
    {
      '$push': { 'campaigns': campaignId }
    },
    { new: true }
  );
}

function findHuntedCampaign(campaignId, myCampaigns) {
  return myCampaigns.find(mycampaign => {
    return mycampaign.id === campaignId;
  });
}

function mapCampaignsWithTotalOfCouponsHuntedByMe(campaignsSelectedByMe, myCoupons) {
  let campaigns = {};
  const myHuntedCoupons = _.filter(myCoupons, {status: config.couponStatus.HUNTED})
  const myRedeemedCoupons = _.filter(myCoupons, {status: config.couponStatus.REDEEMED})
  for(let i = 0; i < campaignsSelectedByMe.length; i++) {
    const campaign = campaignsSelectedByMe[i];
    const couponsHuntedInThisCampaign = _.intersectionBy(campaign.coupons, myHuntedCoupons, 'id');
    const couponsRedeemedInThisCampaign = _.intersectionBy(campaign.coupons, myRedeemedCoupons, 'id');
    campaigns[campaign.id] = {
      couponsHunted: couponsRedeemedInThisCampaign.length + couponsHuntedInThisCampaign.length,
      couponsRedeemed: couponsRedeemedInThisCampaign.length
    }
  }
  return campaigns;
}

function addCouponsHuntedByMeToCampaigns(allSortedCampaigns, myCampaigns, campaignsWithCouponsSelected) {
  let campaigns = [];
  for (let i = 0; i < allSortedCampaigns.length; i++) {
    let campaign = allSortedCampaigns[i];
    const isMyCampaign = findHuntedCampaign(campaign.id, myCampaigns);
    if (isMyCampaign) {
      campaign.couponsHuntedByMe = campaignsWithCouponsSelected[campaign.id].couponsHunted;
      campaign.couponsRedeemedByMe = campaignsWithCouponsSelected[campaign.id].couponsRedeemed;
    } else {
      campaign.couponsHuntedByMe = 0;
      campaign.couponsRedeemedByMe = 0;
    }
    const couponsWereRedeemed = (campaign.couponsHuntedByMe === campaign.couponsRedeemedByMe);
    const campaignIsAvailable = campaign.status === config.campaignStatus.AVAILABLE;
    campaign.canHunt = (couponsWereRedeemed && campaignIsAvailable);

    campaigns.push(campaign);
  }
  return campaigns;
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


const getHunterCoupons = async (models, hunterId) => {
  const hunter = await models.Hunter
                            .findOne({_id: hunterId})
                            .populate('coupons') || {}

  return hunter.coupons || [];
}

const getCampaignsSelectedByMe= async (models, myCoupons) => {
  const campaigns = await models.Campaign
                                .find({
                                  coupons: {
                                    '$in': myCoupons
                                  }
                                })
                                .populate('coupons');

  return campaigns

}

function notifyExpiredCampaignToMaker(pubsub, makerId, expiredCampaign) {
  pubsub.publish(`${config.subscriptionsTopics.EXPIRED_CAMPAIGN_TOPIC}-${makerId}`, {
    expiredCampaign
  });
}
