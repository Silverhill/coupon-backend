exports = module.exports = {
  userRoles: ['hunter', 'maker'],
  adminRoles: ['admin'],
  campaignStatus: {
    UNAVAILABLE: 'unavailable',
    AVAILABLE: 'available',
    EXPIRED: 'expired',
    SOLDOUT: 'soldout'
  },
  couponStatus: {
    AVAILABLE: 'available',
    HUNTED: 'hunted',
    EXPIRED: 'expired',
    REDEEMED: 'redeemed'
  },
  subscriptionsTopics: {
    REDEEMED_COUPON_TOPIC: 'newRedeemedCoupon',
    EXPIRED_CAMPAIGN_TOPIC: 'newExpiredCampaign',
    HUNTED_COUPON_TOPIC: 'newHuntedCoupon',
    UPDATED_CAMPAIGN_TOPIC: 'updatedCampaign'
  },
  uploadsFolder: './uploads/',
  allowedImageFormat: ['.png', '.jpg', '.gif', '.jpeg', '.svg'],
  imageSize: 640
};
