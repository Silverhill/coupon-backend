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
    REDEEMED_COUPON_TOPIC: 'newCouponRedeemed'
  },
  uploadsFolder: './uploads/'
};
