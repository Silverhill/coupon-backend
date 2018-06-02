import test from 'ava';
import { connectDB, dropDB } from '../../mocks/db';
import request from 'supertest';
import app from '../../../server/server';
import utils from '../../utils/test.utils'

const hunterLoginQuery = utils.getHunterLoginQuery();
const makerLoginQuery = utils.getMakerLoginQuery();

test.beforeEach('connect with mongodb', async () => {
  await connectDB();
  await utils.createDefaultUsers();
});

test.afterEach.always(async () => {
  await dropDB();
});

const addCompanyQuery = {
  query: `
    mutation {
      addCompany(input: {
        businessName: "Fogon Grill"
      }) {
        id
        businessName
      }
    }
  `
};

function getAddOfficeQuery(companyId) {
  return {
    query: `
      mutation {
        addOffice(input: {
          ruc: "1132569976001"
          economicActivity: "Comida"
          contributorType: "Natural"
          legalRepresentative: "Juan Perez"
          name: "Fogon Grill sucursal 1"
          officePhone: "2567476"
          cellPhone: "0968755643"
          address: "Rocafuerte y Sucre"
          email: "fogongrill1@test.com"
          companyId: "${companyId}"
        }) {
          id
          ruc
          economicActivity
          legalRepresentative
          officePhone
        }
      }
    `
  }
}

function getAddCampaignQuery(officeId) {
  return {
    query: `
      mutation {
        addCampaign(input: {
          title: "Campaign test 1"
          country: "Ecuador"
          city: "Loja"
          description: "Description 1"
          startAt: ${Date.now()}
          endAt: ${Date.now() + 7200000}
          couponsNumber: 15
          rangeAge: [1,2,3]
          officeId: "${officeId}"
        }) {
          id
          title
          deleted
        }
      }
    `
  }
}

test('Coupon > captureCoupon: Should get access only hunter role', async t => {
  t.plan(3)

  function getCaptureCouponQuery(id) {
    return {
      query: `
        mutation {
          captureCoupon(input: {
            campaignId: "${id}"
          }) {
            id
            code
            status
          }
        }
      `
    }
  }

  let serverRequest = request(app);

  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);

  const res2 = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);
  const res3 = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenMaker);

  const { body: bodyHunter } = res2;
  const { body: bodyMaker } = res3;

  t.truthy(bodyHunter.data);
  t.falsy(bodyMaker.data);

  const { errors: errors1 } = bodyMaker;
  t.is(errors1[0].message, 'Not have permissions for maker role.');
});

test('Coupon > captureCoupon: Should return a coupon', async t => {
  t.plan(4)

  function getCaptureCouponQuery(id) {
    return {
      query: `
        mutation {
          captureCoupon(input: {
            campaignId: "${id}"
          }) {
            id
            code
            status
          }
        }
      `
    }
  }

  let serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);

  // capture coupon
  const captureCouponResponse = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);
  t.is(captureCouponResponse.status, 200);

  const { body: { data: { captureCoupon: coupon1 } } } = captureCouponResponse;
  t.truthy(coupon1.id);
  t.truthy(coupon1.code);
  t.is(coupon1.status, 'hunted');
});

test('Coupon > captureCoupon: Should return a coupon with campaign and maker data', async t => {
  t.plan(4)

  function getCaptureCouponQuery(id) {
    return {
      query: `
        mutation {
          captureCoupon(input: {
            campaignId: "${id}"
          }) {
            id
            code
            status
            campaign {
              id
              title
              maker {
                id
                name
              }
            }
          }
        }
      `
    }
  }

  let serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);

  // capture coupon
  const { body: { data: { captureCoupon: coupon1 } } } = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);

  t.truthy(coupon1.campaign);
  t.is(coupon1.campaign.title, 'Campaign test 1');

  t.truthy(coupon1.campaign.maker);
  t.is(coupon1.campaign.maker.name, 'Maker');
});

test('Coupon > captureCoupon: Should capture only one coupon', async t => {
  t.plan(4)

  function getCaptureCouponQuery(id) {
    return {
      query: `
        mutation {
          captureCoupon(input: {
            campaignId: "${id}"
          }) {
            id
            code
            status
          }
        }
      `
    }
  }

  let serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);

  // capture coupon 1
  const captureCouponResponse1 = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);
  t.is(captureCouponResponse1.status, 200);
  const { body: { data: { captureCoupon: coupon1 } } } = captureCouponResponse1;
  t.truthy(coupon1);

  // capture coupon 2
  const captureCouponResponse2 = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);
  t.is(captureCouponResponse2.status, 200
  );

  const { body: { errors } } = captureCouponResponse2;
  t.is(errors[0].message, 'You can only capture one coupon for this campaign.');

});

test('Coupon > captureCoupon: Should update the campaign counters', async t => {
  t.plan(5);

  function getCaptureCouponQuery(id) {
    return {
      query: `
        mutation {
          captureCoupon(input: {
            campaignId: "${id}"
          }) {
            id
            code
            status
          }
        }
      `
    }
  }

  function getCampaignQuery(id) {
    return {
      query: `
        {
          campaign(id: "${id}") {
            id
            title
            totalCoupons
            huntedCoupons
            redeemedCoupons
          }
        }
      `
    }
  }

  const serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);

  // capture coupon 1
  const captureCouponResponse1 = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);
  t.is(captureCouponResponse1.status, 200);
  const { body: { data: { captureCoupon: coupon1 } } } = captureCouponResponse1;
  t.truthy(coupon1);

  // get campaign
  const campaignResponse = await utils.callToQraphql(serverRequest, getCampaignQuery(addCampaign.id), tokenMaker);
  const { body: { data: { campaign } } } = campaignResponse;

  t.is(campaign.totalCoupons, 15);
  t.is(campaign.huntedCoupons, 1);
  t.is(campaign.redeemedCoupons, 0);
});

test('Coupon > redeemCoupon: Should get access only hunter user', async t => {
  t.plan(3);

  function getRedeemCouponQuery(couponCode) {
    return {
      query: `
        mutation {
          redeemCoupon(input: {
            couponCode: "${couponCode}"
          }) {
            id
            code
            status
          }
        }
      `
    }
  }

  function getCaptureCouponQuery(id) {
    return {
      query: `
        mutation {
          captureCoupon(input: {
            campaignId: "${id}"
          }) {
            id
            code
            status
          }
        }
      `
    }
  }

  let serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);

  // capture coupon 1
  const { body: { data: { captureCoupon: coupon1 } } } = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);

  // redeem coupon 1
  const resRedeemCoupon1 = await utils.callToQraphql(serverRequest, getRedeemCouponQuery(coupon1.code), tokenHunter);
  const resRedeemCoupon2 = await utils.callToQraphql(serverRequest, getRedeemCouponQuery(coupon1.code), tokenMaker);

  const { body: bodyHunter } = resRedeemCoupon1;
  const { body: bodyMaker } = resRedeemCoupon2;

  t.falsy(bodyHunter.data);
  t.truthy(bodyMaker.data);
  t.is(bodyHunter.errors[0].message, 'Not have permissions for hunter role.');

});

test('Coupon > redeemCoupon: Should update the campaign counters', async t => {
  t.plan(3);

  function getRedeemCouponQuery(couponCode) {
    return {
      query: `
        mutation {
          redeemCoupon(input: {
            couponCode: "${couponCode}"
          }) {
            id
            code
            status
            campaign {
              id
              redeemedCoupons
            }
          }
        }
      `
    }
  }

  function getCaptureCouponQuery(id) {
    return {
      query: `
        mutation {
          captureCoupon(input: {
            campaignId: "${id}"
          }) {
            id
            code
            status
          }
        }
      `
    }
  }

  const serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);

  // capture coupon 1
  const { body: { data: { captureCoupon: coupon1 } } } = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);

  // redeem coupon 1
  const { body: { data: { redeemCoupon } } } = await utils.callToQraphql(serverRequest, getRedeemCouponQuery(coupon1.code), tokenMaker);

  t.truthy(redeemCoupon.id);
  t.is(redeemCoupon.status, 'redeemed');
  t.is(redeemCoupon.campaign.redeemedCoupons, 1)
});

test('Coupon > redeemCoupon: Should return an error if the code is invalid', async t => {
  t.plan(1);

  function getRedeemCouponQuery(couponCode) {
    return {
      query: `
        mutation {
          redeemCoupon(input: {
            couponCode: "${couponCode}"
          }) {
            id
            code
            status
          }
        }
      `
    }
  }

  function getCaptureCouponQuery(id) {
    return {
      query: `
        mutation {
          captureCoupon(input: {
            campaignId: "${id}"
          }) {
            id
            code
            status
          }
        }
      `
    }
  }

  const serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);

  // capture coupon 1
  await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);

  // redeem coupon 1
  const { body: { errors } } = await utils.callToQraphql(serverRequest, getRedeemCouponQuery('invalidcode'), tokenMaker);

  t.is(errors[0].message, 'Invalid coupon code.');
});

test('Coupon: redeemCoupon > Should return an error if the coupon has already been redeemed', async t => {
  t.plan(1);

  function getRedeemCouponQuery(couponCode) {
    return {
      query: `
        mutation {
          redeemCoupon(input: {
            couponCode: "${couponCode}"
          }) {
            id
            code
            status
          }
        }
      `
    }
  }

  function getCaptureCouponQuery(id) {
    return {
      query: `
        mutation {
          captureCoupon(input: {
            campaignId: "${id}"
          }) {
            id
            code
            status
          }
        }
      `
    }
  }

  const serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);

  // capture coupon 1
  const { body: { data: { captureCoupon: coupon1 } } } = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);

  // redeem coupon 1
  await utils.callToQraphql(serverRequest, getRedeemCouponQuery(coupon1.code), tokenMaker);
  const { body: { errors } } = await utils.callToQraphql(serverRequest, getRedeemCouponQuery(coupon1.code), tokenMaker);

  t.is(errors[0].message, 'This coupon has already been redeemed.');
});

test('Campaign: captureCoupon > Should return a campaign within the coupon after the Hunter has hunted it', async t => {
  t.plan(5)

  function getCaptureCouponQuery(id) {
    return {
      query: `
        mutation {
          captureCoupon(input: {
            campaignId: "${id}"
          }) {
            id
            code
            status
            campaign {
              id
              title
              description
            }
          }
        }
      `
    }
  }

  let serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);

  // capture coupon
  const { body: { data: { captureCoupon } } } = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);

  t.truthy(captureCoupon.id);
  t.truthy(captureCoupon.campaign)
  t.truthy(captureCoupon.campaign.id)
  t.is(captureCoupon.campaign.title, 'Campaign test 1');
  t.is(captureCoupon.campaign.description, 'Description 1');
});

test('Campaign: captureCoupon > Should return an error if the Campaing is SOLD-OUT', async t => {
  t.plan(1)

  function getSmallAddCampaignQuery(officeId) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "Campaign test 1"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            startAt: ${Date.now()}
            endAt: ${Date.now() + 7200000}
            couponsNumber: 2
            rangeAge: [1,3,4]
            officeId: "${officeId}"
          }) {
            id
          }
        }
      `
    }
  }

  function getCaptureCouponQuery(id) {
    return {
      query: `
        mutation {
          captureCoupon(input: {
            campaignId: "${id}"
          }) {
            code
          }
        }
      `
    }
  }

  function getRedeemCouponQuery(couponCode) {
    return {
      query: `
        mutation {
          redeemCoupon(input: {
            couponCode: "${couponCode}"
          }) {
            id
          }
        }
      `
    }
  }

  let serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getSmallAddCampaignQuery(addOffice.id), tokenMaker);

  // capture coupon 1
  const { body: { data: { captureCoupon: coupon1 } } } = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);
  await utils.callToQraphql(serverRequest, getRedeemCouponQuery(coupon1.code), tokenMaker);

  // capture coupon 2
  const { body: { data: { captureCoupon: coupon2 } } } = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);
  await utils.callToQraphql(serverRequest, getRedeemCouponQuery(coupon2.code), tokenMaker);

  // capture coupon 3
  const { body: { errors } } = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);

  t.is(errors[0].message, 'This campaign is sold out.');
});
