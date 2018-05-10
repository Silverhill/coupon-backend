import config from '../../../config'

export const redeemedCoupon = (params) => {
  return {
    subscribe: () => {
      return params.pubsub.asyncIterator(config.subscriptionsTopics.REDEEMED_COUPON_TOPIC)
    }
  }
};

