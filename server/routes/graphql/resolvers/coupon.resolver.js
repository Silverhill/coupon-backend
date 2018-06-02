import config from '../../../config';
import shorthash from 'shorthash';
import _ from 'lodash'
import * as NotificationService from '../../../services/notification.service'

export const getCoupon = async (parent, args, { models }) => {

  const { id } = args;
  const coupon = await models.Coupon.findOne({ _id: id });
  return coupon;
};

export const captureCoupon = async (parent, args, { models, params }) => {
  const { input: {campaignId} } = args;
  const { pubsub } = params;
  const {_id: hunterId} = args.currentUser;

  const campaign = await models.Campaign.findOne({
    _id: campaignId
  })
  .populate('maker') || {};

  if (_.isEmpty(campaign)) {
    throw Error('Campaign not found.');
  }

  if (campaign.status === config.campaignStatus.SOLDOUT) {
    throw Error('This campaign is sold out.');
  }

  if (campaign.status === config.campaignStatus.UNAVAILABLE) {
    throw Error('The campaign is unavailable.');
  }

  if (campaign.status === config.campaignStatus.EXPIRED ) {
    throw Error('The campaign has expired.');
  }

  //TODO: Al momento que se capturan todos los cupones disponibles se debe
  //emitir un evento por sockets para actualizar la campaña en el frontend
  try {

    const { coupons: hunterCoupons } = await getMyHuntedCoupons(models, campaignId, hunterId);

    if (hunterCoupons && (hunterCoupons.length === 1)) {
      throw new Error('You can only capture one coupon for this campaign.');
    }

    const couponParams = {
      status: config.couponStatus.AVAILABLE,
      campaign: campaignId,
      huntedAt: new Date(),
      hunter: hunterId
    }

    const newCoupon = await new models.Coupon(couponParams) || {};
    newCoupon.code = generateCouponCode(newCoupon.id);
    await newCoupon.save();

    await addCouponToCampaign(models, campaignId, newCoupon._id);

    await updateHunterAndCampignModels({
      models,
      hunterId,
      campaignId,
      couponId: newCoupon.id,
      huntedCoupons: campaign.huntedCoupons
    });

    const updatedCoupon = await updateCouponStatus(models, newCoupon._id, hunterId);
    const { maker: makerOfCampaign } = campaign;

    if (makerOfCampaign && makerOfCampaign.id) {
      NotificationService.notifyHuntedCouponToMaker(pubsub, makerOfCampaign.id, updatedCoupon);
      NotificationService.notifyUpdatedCampaing(pubsub, models, campaignId, hunterId);
    }

    return updatedCoupon;

  } catch (error) {
    return error;
  }

};

export const redeemCoupon = async (parent, args, { models, params }) => {
  const {input: { couponCode } } = args;
  const {_id: makerId} = args.currentUser;
  const { pubsub } = params;
  const campaigns = await models.Campaign.where({
    maker: makerId,
  }) || [];
  const couponData = await models.Coupon.findOne({
    campaign: {'$in': campaigns },
    code: couponCode
  })
  .populate('campaign')

  if (_.isEmpty(couponData)) {
    throw Error('Invalid coupon code.');
  }

  const { campaign: myCampaign } = couponData;

  if (couponData.status === config.couponStatus.REDEEMED) {
    throw Error('This coupon has already been redeemed.');
  }

  if (myCampaign.status === config.campaignStatus.UNAVAILABLE) {
    throw Error('The campaign is unavailable.');
  }

  if (myCampaign.status === config.campaignStatus.EXPIRED ) {
    throw Error('The campaign has expired.');
  }

  await updateRedeemedCouponsCount(models, myCampaign);
  const couponUpdated = await updateCouponToRedeemed(models, couponData._id);
  if (couponUpdated.hunter && couponUpdated.hunter.id) {
    NotificationService.notifyRedeemedCouponToHunter(pubsub, couponUpdated.hunter.id, couponUpdated);
    NotificationService.notifyUpdatedCampaing(pubsub, models, myCampaign.id, couponUpdated.hunter.id);
  }

  return couponUpdated;
}

export const getCouponsByHunter = async (parent, {
    limit = 10,
    skip = 0,
    sortField = 'createdAt',
    sortDirection = 1,
    ...args
  }, { models }) => {

  const sortObject = {};
  sortObject[sortField] = sortDirection;
  const hunterId = args.hunterId;
  const { coupons } = await models.Hunter.findOne({ _id: hunterId }) || {};
  const makerId = args.currentUser._id;
  const campaigns = await models.Campaign.find({
    maker: makerId
  });
  const myCouponsInfo = await models.Coupon.find({
    _id: { "$in": coupons || [] },
    campaign: {"$in": campaigns || {}}
  })
    .limit(limit)
    .skip(skip)
    .sort(sortObject)
    .populate({
      path: 'campaign',
      select: '-coupons'
    }) || [];

    return myCouponsInfo;
}

function getCampaignWithCoupons(models, campaignId, match) {
  return models.Campaign.findOne({ _id: campaignId }).populate({
    path: 'coupons',
    match
  });
}

async function getMyHuntedCoupons(models, campaignId, hunterId) {
  const campaign = await getCampaignWithCoupons(models, campaignId, {
    hunter: hunterId,
    status: config.couponStatus.HUNTED
  });
  return campaign || {};
}

function updateCouponStatus(models, couponId, hunterId) {
  return models.Coupon.findByIdAndUpdate(couponId,
    {
      hunter: hunterId,
      status: config.couponStatus.HUNTED
    },
    { new: true }
  )
  .populate({
    path: 'campaign',
    populate: {
      path: 'maker',
      select: '-salt -password'
    }
  });
}

function updateHunterAndCampignModels(params) {

  const { models,
    hunterId,
    campaignId,
    couponId,
    huntedCoupons } = params;

  const hunterPromise = models.Hunter.findByIdAndUpdate(hunterId,
    {
      '$push': { 'coupons': couponId }
    },
    { new: true }
  );

  const campaignPromise = models.Campaign.findByIdAndUpdate(campaignId,
    {
      huntedCoupons: huntedCoupons + 1
    },
    { new: true }
  );

  return Promise.all([hunterPromise, campaignPromise]);
}

function generateCouponCode(couponId) {
  return shorthash.unique(couponId);
}

function addCouponToCampaign(models, campaignId, couponId) {
  return models.Campaign.findByIdAndUpdate(campaignId,
    {
      '$push': { 'coupons': couponId }
    },
    { new: true }
  );
}

function updateRedeemedCouponsCount(models, myCampaign) {
  return models.Campaign.findByIdAndUpdate(myCampaign._id,
    {
      redeemedCoupons: myCampaign.redeemedCoupons + 1
    },
    { new: true }
  );
}

function updateCouponToRedeemed(models, couponId) {
  return models.Coupon.findByIdAndUpdate(couponId,
    {
      status: config.couponStatus.REDEEMED,
      redeemedAt: new Date()
    },
    { new: true }
  )
  .populate('campaign')
  .populate('hunter')
  .exec();
}
