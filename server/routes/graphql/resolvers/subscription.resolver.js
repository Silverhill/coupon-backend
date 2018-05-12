import config from '../../../config'

export const redeemedCoupon = (params) => {
  return {
    subscribe: () => {
      return params.pubsub.asyncIterator(config.subscriptionsTopics.REDEEMED_COUPON_TOPIC)
    }
  }
};

export const huntedCoupon = (params) => {
  return {
    subscribe: () => {
      return params.pubsub.asyncIterator(config.subscriptionsTopics.HUNTED_COUPON_TOPIC)
    }
  }
};

export const expiredCampaign = (params) => {
  return {
    subscribe: () => {
      return params.pubsub.asyncIterator(config.subscriptionsTopics.EXPIRED_CAMPAIGN_TOPIC)
    }
  }
};

