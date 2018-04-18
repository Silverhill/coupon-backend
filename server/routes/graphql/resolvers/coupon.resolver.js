import config from '../../../config';
import jwt from 'jsonwebtoken';

export const getCoupon = async (parent, args, { models }) => {

  const { id } = args;
  const coupon = await models.Coupon.findOne({ _id: id });
  return coupon;
};

export const captureCoupon = async (parent, args, { models, request }) => {
  const { input: {campaignId} } = args;
  const { headers: { authentication } } = request;
  const { _id: hunterId } = await jwt.verify(authentication, config.secrets.session);

  //TODO: Validar que la campaña tenga cupones disponibles
  //TODO: Validar que la campaña este activa
  //TODO: Actualizar el estado (status) del cupon acorde a las necesidades
  //TODO: Al momento que se capturan todos los cupones disponibles se debe
  //emitir un evento por sockets para actualizar la campaña en el frontend
  try {

    const { coupons: hunterCoupons } = await getCouponsFromCampaign(models, campaignId, {
      hunter: hunterId,
      status: 'hunted'
    });

    if (hunterCoupons.length === 1) {
      throw new Error('You can only capture one coupon for this campaign.');
    }

    const { coupons, huntedCoupons } = await getCouponsFromCampaign(models, campaignId, {
      status: 'available'
    });

    const coupon = getLastItem(coupons);

    const updatedCoupon = await models.Coupon.findByIdAndUpdate(coupon._id,
      {
        hunter: hunterId,
        status: 'hunted',
        updatedAt: new Date()
      },
      { new: true }
    );

    await models.Hunter.findByIdAndUpdate(hunterId,
      {
        '$push': { 'coupons': updatedCoupon.id },
        updatedAt: new Date()
      },
      { new: true }
    );

    await models.Campaign.findByIdAndUpdate(campaignId,
      {
        huntedCoupons: huntedCoupons + 1,
        updatedAt: new Date()
      },
      { new: true }
    );

    return updatedCoupon;
  } catch (error) {
    return error;
  }

};

async function getCouponsFromCampaign(models, campaignId, match) {
  return await models.Campaign.findOne({ _id: campaignId }).populate({
    path: 'coupons',
    match
  });
}

function getLastItem(items) {
  return items.pop();
}
