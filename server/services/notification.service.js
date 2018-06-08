import * as CommonService from './common.service'
import config from '../config';

export const notifyRedeemedCouponToHunter = (pubsub, hunterId, redeemedCoupon) => {
  pubsub.publish(`${config.subscriptionsTopics.REDEEMED_COUPON_TOPIC}-${hunterId}`, {
    redeemedCoupon
  });
}

export const notifyHuntedCouponToMaker = (pubsub, makerId, huntedCoupon) => {
  pubsub.publish(`${config.subscriptionsTopics.HUNTED_COUPON_TOPIC}-${makerId}`, {
    huntedCoupon
  });
}

export const notifyExpiredCampaignToMaker = (pubsub, makerId, expiredCampaign) => {
  pubsub.publish(`${config.subscriptionsTopics.EXPIRED_CAMPAIGN_TOPIC}-${makerId}`, {
    expiredCampaign
  });
}

export const notifyUpdatedCampaing = async (pubsub, models, campaignId, hunterId) => {

  const updatedCampaign = await models.Campaign.findOne({
    _id: campaignId
  })
  .populate({
    path: 'maker',
    elect: '-campaigns -salt -password'
  })
  .populate( {
    path: 'office',
    select: '-campaigns',
    populate: {
      path: 'company',
      select: '-offices -campaigns',
    }
  })
  .exec();

  const myCoupons = await CommonService.getHunterCoupons(models, hunterId);
  const campaignsSelectedByMe = await CommonService.getCampaignsSelectedByMe(models, myCoupons);
  const campaignsWithCouponsSelected = CommonService.mapCampaignsWithTotalOfCouponsHuntedByMe(campaignsSelectedByMe, myCoupons);
  const campaignsWithDetails = CommonService.addCouponsHuntedByMeToCampaigns([updatedCampaign], campaignsSelectedByMe, campaignsWithCouponsSelected)

  pubsub.publish(`${config.subscriptionsTopics.UPDATED_CAMPAIGN_TOPIC}-${campaignId}`, {
    updatedCampaign: campaignsWithDetails[0]
  });
}
