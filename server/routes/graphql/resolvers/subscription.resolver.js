import config from '../../../config'

export const redeemedCoupon = (params) => {
  return {
    subscribe: (arg1, arg2, connectionParams) => {
      const hunterId = getUserId(connectionParams);
      if (hunterId) {
        return params.pubsub.asyncIterator(`${config.subscriptionsTopics.REDEEMED_COUPON_TOPIC}-${hunterId}`)
      } else {
        throw Error('There is a problem connecting to "redeemedCoupon" subscription. Please check the connection params');
      }
    }
  }
};

export const huntedCoupon = (params) => {
  return {
    subscribe: (arg1, arg2, connectionParams) => {
      const makerId = getUserId(connectionParams);
      if (makerId) {
        return params.pubsub.asyncIterator(`${config.subscriptionsTopics.HUNTED_COUPON_TOPIC}-${makerId}`)
      } else {
        throw Error('There is a problem connecting to "huntedCoupon" subscription. Please check the connection params');
      }
    }
  }
};

export const expiredCampaign = (params) => {
  return {
    subscribe: (arg1, arg2, connectionParams) => {
      const makerId = getUserId(connectionParams);
      if (makerId) {
        return params.pubsub.asyncIterator(`${config.subscriptionsTopics.EXPIRED_CAMPAIGN_TOPIC}-${makerId}`)
      } else {
        throw Error('There is a problem connecting to "expiredCampaign" subscription. Please check the connection params');
      }
    }
  }
};

const getUserId = (params) => {
  return (params && params.currentUser) ? params.currentUser.id : null
}
