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

  try {

    const { coupons: hunterCoupons } = await models.Campaign.findOne({ _id: campaignId }).populate({
      path: 'coupons',
      match: {
        hunter: hunterId,
        status: 'huntered'
      }
    });

    if (hunterCoupons.length === 1) {
      throw new Error('You can only capture one coupon for this campaign.');
    }

    const { coupons, capturedCoupons } = await models.Campaign.findOne({ _id: campaignId }).populate({
      path: 'coupons',
      match: { status: 'available'}
    });

    const coupon = coupons.pop();

    const updatedCoupon = await models.Coupon.findByIdAndUpdate(coupon._id,
      {
        hunter: hunterId,
        status: 'huntered',
        updateAt: new Date()
      },
      { new: true }
    );

    await models.Hunter.findByIdAndUpdate(hunterId,
      {
        '$push': { 'coupons': updatedCoupon.id },
        updateAt: new Date()
      },
      { new: true }
    );

    await models.Campaign.findByIdAndUpdate(campaignId,
      {
        capturedCoupons: capturedCoupons + 1,
        updateAt: new Date()
      },
      { new: true }
    );

    return updatedCoupon;
  } catch (error) {
    return error;
  }

};
