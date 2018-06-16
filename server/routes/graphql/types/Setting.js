export default `
  interface SettingBase {
    scoreRedeemCoupon: Int!
  }

  type Setting implements SettingBase {
    scoreRedeemCoupon: Int!
  }

  input UpdateSettingInput {
    scoreRedeemCoupon: Int!
  }

`
