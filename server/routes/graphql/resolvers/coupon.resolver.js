import config from '../../../config';
import shorthash from 'shorthash';
import _ from 'lodash'

export const getCoupon = async (parent, args, { models }) => {

  const { id } = args;
  const coupon = await models.Coupon.findOne({ _id: id });
  return coupon;
};

export const captureCoupon = async (parent, args, { models }) => {
  const { input: {campaignId} } = args;
  const {_id: hunterId} = args.currentUser;

  const campaign = await models.Campaign.findOne({
    _id: campaignId
  });

  if (campaign.status === config.campaignStatus.UNAVAILABLE) {
    throw Error('The campaign is unavailable.');
  }

  if (campaign.status === config.campaignStatus.EXPIRED ) {
    throw Error('The campaign has expired.');
  }

  //TODO: Validar que la campaña tenga cupones disponibles
  //TODO: Actualizar el estado (status) del cupon acorde a las necesidades
  //TODO: Al momento que se capturan todos los cupones disponibles se debe
  //emitir un evento por sockets para actualizar la campaña en el frontend
  //TODO: Habilitar a que el hunter pueda cazar un nuevo cupon una vez que
  // el anterior haya sido canjeado
  try {

    const { coupons: hunterCoupons } = await getMyHuntedCoupons(models, campaignId, hunterId);

    if (hunterCoupons && (hunterCoupons.length === 1)) {
      throw new Error('You can only capture one coupon for this campaign.');
    }

    const couponParams = {
      status: config.couponStatus.AVAILABLE,
      createdAt: new Date(),
      updatedAt: new Date(),
      campaign: campaignId,
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
    return updatedCoupon;

  } catch (error) {
    return error;
  }

};

export const redeemCoupon = async (parent, args, { models }) => {
  const {input: { couponCode } } = args;
  const {_id: makerId} = args.currentUser;
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

  try {
    await updateRedeemedCouponsCount(models, myCampaign);
    const couponUpdated = await updateCouponToRedeemed(models, couponData._id);
    return couponUpdated;
  } catch (error) {
    return error;
  }

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
      status: config.couponStatus.HUNTED,
      updatedAt: new Date()
    },
    { new: true }
  )
  .populate('campaign');
}

function updateHunterAndCampignModels(params) {

  const { models,
    hunterId,
    campaignId,
    couponId,
    huntedCoupons } = params;

  const hunterPromise = models.Hunter.findByIdAndUpdate(hunterId,
    {
      '$push': { 'coupons': couponId },
      updatedAt: new Date()
    },
    { new: true }
  );

  const campaignPromise = models.Campaign.findByIdAndUpdate(campaignId,
    {
      huntedCoupons: huntedCoupons + 1,
      updatedAt: new Date()
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
      '$push': { 'coupons': couponId },
      updatedAt: new Date()
    },
    { new: true }
  );
}

function updateRedeemedCouponsCount(models, myCampaign) {
  return models.Campaign.findByIdAndUpdate(myCampaign._id,
    {
      redeemedCoupons: myCampaign.redeemedCoupons + 1,
      updatedAt: new Date()
    },
    { new: true }
  );
}

function updateCouponToRedeemed(models, couponId) {
  return models.Coupon.findByIdAndUpdate(couponId,
    {
      status: config.couponStatus.REDEEMED,
      updatedAt: new Date()
    },
    { new: true }
  )
  .populate('campaign');
}
