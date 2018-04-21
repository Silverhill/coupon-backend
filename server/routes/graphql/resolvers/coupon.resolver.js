import config from '../../../config';
import { extractUserIdFromToken } from '../../../services/model.service';
import shortid from 'shortid';

export const getCoupon = async (parent, args, { models }) => {

  const { id } = args;
  const coupon = await models.Coupon.findOne({ _id: id });
  return coupon;
};

export const captureCoupon = async (parent, args, { models, request }) => {
  const { input: {campaignId} } = args;
  const { headers: { authentication } } = request;
  const hunterId = await extractUserIdFromToken(authentication);

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

    if (hunterCoupons.length === 1) {
      throw new Error('You can only capture one coupon for this campaign.');
    }

    const { coupons, huntedCoupons } = await getCouponsFromCampaign(models, campaignId, {
      status: config.couponStatus.AVAILABLE
    });

    const coupon = getLastItem(coupons);

    await updateHunterAndCampignModels({
      models,
      hunterId,
      campaignId,
      couponId: coupon.id,
      huntedCoupons
    });

    const updatedCoupon = await updateCouponStatus(models, coupon._id, hunterId);
    return updatedCoupon;

  } catch (error) {
    return error;
  }

};

export const redeemCoupon = async (parent, args, { models, request }) => {

  const {input: { campaignId, couponId, couponCode } } = args;
  const { headers: { authentication } } = request;
  const hunterId = await extractUserIdFromToken(authentication);

  const campaign = await models.Campaign.findOne({
    _id: campaignId,
    coupons: {
      '$in': [couponId]
    }
  });

  if (!campaign) {
    throw Error('The specified campaign could not be found.');
  }

  if (campaign.status === config.campaignStatus.UNAVAILABLE) {
    throw Error('The campaign is unavailable.');
  }

  if (campaign.status === config.campaignStatus.EXPIRED ) {
    throw Error('The campaign has expired.');
  }

  const mycoupon = await models.Coupon.findOne({
    _id: couponId,
    hunter: hunterId
  });

  if (mycoupon.code !== couponCode || !shortid.isValid(couponCode)) {
    throw Error('Invalid coupon code.');
  }

  if (mycoupon.status === config.couponStatus.REDEEMED) {
    throw Error('This coupon has already been redeemed.');
  }

  try {

    await models.Campaign.findByIdAndUpdate(campaign._id,
      {
        redeemedCoupons: campaign.redeemedCoupons + 1,
        updatedAt: new Date()
      },
      { new: true }
    );

    const couponUpdated = await models.Coupon.findByIdAndUpdate(mycoupon._id,
      {
        status: config.couponStatus.REDEEMED,
        updatedAt: new Date()
      },
      { new: true }
    )
    .populate('campaign');

    return couponUpdated;

  } catch (error) {
    return error;
  }

}

function getCouponsFromCampaign(models, campaignId, match) {
  return models.Campaign.findOne({ _id: campaignId }).populate({
    path: 'coupons',
    match
  });
}

function getLastItem(items) {
  return items.pop();
}

function getMyHuntedCoupons(models, campaignId, hunterId) {
  return getCouponsFromCampaign(models, campaignId, {
    hunter: hunterId,
    status: config.couponStatus.HUNTED
  });
}

function updateCouponStatus(models, couponId, hunterId) {
  return models.Coupon.findByIdAndUpdate(couponId,
    {
      hunter: hunterId,
      status: config.couponStatus.HUNTED,
      updatedAt: new Date()
    },
    { new: true }
  );
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
