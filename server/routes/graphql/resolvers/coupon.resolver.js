export const getCoupon = async (parent, args, { models }) => {
  const { id } = args;
  const coupon = await models.Coupon.findOne({ _id: id });
  return coupon;
};
