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
          ruc: "2222222222"
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

const meQuery = {
  query: `
    {
      me {
        id
      }
    }
  `
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
          rangeAge: [1,2]
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

test('Coupon: huntedCouponsByCampaign > Should get access only hunter role', async t => {
  t.plan(3)

  function getHuntedCouponsByCampaignQuery(id) {
    return {
      query: `
        {
          huntedCouponsByCampaign(campaignId: "${id}") {
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

  const res2 = await utils.callToQraphql(serverRequest, getHuntedCouponsByCampaignQuery(addCampaign.id), tokenHunter);
  const res3 = await utils.callToQraphql(serverRequest, getHuntedCouponsByCampaignQuery(addCampaign.id), tokenMaker);

  const { body: bodyHunter } = res2;
  const { body: bodyMaker } = res3;

  t.falsy(bodyHunter.data.huntedCouponsByCampaign);
  t.truthy(bodyMaker.data);

  const { errors: errors1 } = bodyHunter;
  t.is(errors1[0].message, 'Not have permissions for hunter role.');
});

test('User: Hunter: myRedeemedCoupons > Should return the list of my redeemed coupons', async t => {
  t.plan(8)

  const myRedeemedCouponsQuery = {
    query: `
      {
        myRedeemedCoupons {
          ...on CouponHunted {
            id
            code
            status
            campaign {
              title
              maker {
                id
                name
                provider
              }
              office {
                id
                name
                legalRepresentative
                email
              }
            }
          }
        }
      }
    `
  }

  function getAddCampaignQuery(officeId, title) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "${title}"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            startAt: ${Date.now()}
            endAt: ${Date.now() + 7200000}
            couponsNumber: 20
            rangeAge: [1,2]
            officeId: "${officeId}"
          }) {
            id
            title
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

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 1'), tokenMaker);
  await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 2'), tokenMaker);
  const { body: { data: { captureCoupon: coupon1 } } } = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);
  await utils.callToQraphql(serverRequest, getRedeemCouponQuery(coupon1.code), tokenMaker);

  //My redeemed coupons

  const { body: { data: { myRedeemedCoupons }}} = await utils.callToQraphql(serverRequest, myRedeemedCouponsQuery, tokenHunter);

  t.is(myRedeemedCoupons.length, 1);
  t.truthy(myRedeemedCoupons[0]);
  t.is(myRedeemedCoupons[0].status, 'redeemed');
  t.truthy(myRedeemedCoupons[0].campaign);
  t.truthy(myRedeemedCoupons[0].campaign.maker);
  t.is(myRedeemedCoupons[0].campaign.maker.name, 'Maker');
  t.truthy(myRedeemedCoupons[0].campaign.office);
  t.is(myRedeemedCoupons[0].campaign.office.name, 'Fogon Grill sucursal 1');
});

test('Coupon: Maker: couponsByHunter > Should return coupons from a specific Hunter', async t => {
  t.plan(9)

  function getCouponsByHunterQuery(hunterId) {
    return {
      query: `
        {
          couponsByHunter(hunterId: "${hunterId}") {
            ...on CouponForMaker {
              id
              code
              status
              updatedAt
              campaign {
                id
                title
              }
            }
          }
        }
      `
    }

  }

  function getAddCampaignQuery(officeId, title) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "${title}"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            startAt: ${Date.now()}
            endAt: ${Date.now() + 7200000}
            couponsNumber: 20
            rangeAge: [1,2]
            officeId: "${officeId}"
          }) {
            id
            title
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

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign: addCampaign1 } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 1'), tokenMaker);
  const { body: { data: { addCampaign: addCampaign2 } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 2'), tokenMaker);
  //Hunt coupon1
  const { body: { data: { captureCoupon: coupon1 } } } = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign1.id), tokenHunter);
  //Hunt coupon2
  await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign2.id), tokenHunter);
  //Redeem coupon1
  await utils.callToQraphql(serverRequest, getRedeemCouponQuery(coupon1.code), tokenMaker);
  // Get Hunter data
  const { body: { data: { me: hunterData } } } = await utils.callToQraphql(serverRequest, meQuery, tokenHunter);
  //Coupons by Hunter
  const { body: { data: { couponsByHunter }}} = await utils.callToQraphql(serverRequest, getCouponsByHunterQuery(hunterData.id), tokenMaker);

  t.is(couponsByHunter.length, 2);
  t.is(couponsByHunter[0].status, 'redeemed');
  t.truthy(couponsByHunter[0].updatedAt);
  t.truthy(couponsByHunter[0].campaign);
  t.is(couponsByHunter[0].campaign.title, 'Campaign 1');
  t.is(couponsByHunter[1].status, 'hunted');
  t.truthy(couponsByHunter[1].updatedAt);
  t.truthy(couponsByHunter[1].campaign);
  t.is(couponsByHunter[1].campaign.title, 'Campaign 2');

});

test('Coupon: Hunter: myCoupons > Should return my coupons', async t => {
  t.plan(9)

  const myCouponsQuery = {
    query: `
      {
        myCoupons {
          ...on CouponHunted {
            id
            status
            campaign {
              title
              maker {
                id
                name
              }
              office {
                id
                name
              }
            }
          }
        }
      }
    `
  }

  function getAddCampaignQuery(officeId, title) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "${title}"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            startAt: ${Date.now()}
            endAt: ${Date.now() + 7200000}
            couponsNumber: 20
            rangeAge: [1,2]
            officeId: "${officeId}"
          }) {
            id
            title
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

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign: campaign1 } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 1'), tokenMaker);
  const { body: { data: { addCampaign: campaign2 } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 2'), tokenMaker);

  await utils.callToQraphql(serverRequest, getCaptureCouponQuery(campaign1.id), tokenHunter);
  await utils.callToQraphql(serverRequest, getCaptureCouponQuery(campaign2.id), tokenHunter);

  //My coupons
  const { body: { data: { myCoupons }}} = await utils.callToQraphql(serverRequest, myCouponsQuery, tokenHunter);

  t.is(myCoupons.length, 2);
  t.is(myCoupons[0].status, 'hunted');
  t.is(myCoupons[0].campaign.title, 'Campaign 1');
  t.is(myCoupons[0].campaign.maker.name, 'Maker');
  t.is(myCoupons[0].campaign.office.name, 'Fogon Grill sucursal 1');
  t.is(myCoupons[1].status, 'hunted');
  t.is(myCoupons[1].campaign.title, 'Campaign 2');
  t.is(myCoupons[1].campaign.maker.name, 'Maker');
  t.is(myCoupons[1].campaign.office.name, 'Fogon Grill sucursal 1');
});

test('Coupon: Hunter: myCoupons > Should return my coupons with "huntedAt" and "redeemedAt" params', async t => {
  t.plan(3)

  const myCouponsQuery = {
    query: `
      {
        myCoupons {
          ...on CouponHunted {
            id
            status
            huntedAt
            redeemedAt
          }
        }
      }
    `
  }

  function getAddCampaignQuery(officeId, title) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "${title}"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            startAt: ${Date.now()}
            endAt: ${Date.now() + 7200000}
            couponsNumber: 20
            rangeAge: [1,2]
            officeId: "${officeId}"
          }) {
            id
            title
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

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 1'), tokenMaker);
  //Hunt coupon
  await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);
  //My coupons
  const { body: { data: { myCoupons: myCoupons1 }}} = await utils.callToQraphql(serverRequest, myCouponsQuery, tokenHunter);

  t.is(myCoupons1[0].status, 'hunted');
  t.truthy(myCoupons1[0].huntedAt);
  t.is(myCoupons1[0].redeemedAt, null);
});

test('Coupon: Hunter: myRedeemedCoupons > Should return my coupons with "huntedAt" and "redeemedAt" params', async t => {
  t.plan(3)

  const myRedeemedCouponsQuery = {
    query: `
      {
        myRedeemedCoupons {
          ...on CouponHunted {
            id
            status
            huntedAt
            redeemedAt
          }
        }
      }
    `
  }

  function getAddCampaignQuery(officeId, title) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "${title}"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            startAt: ${Date.now()}
            endAt: ${Date.now() + 7200000}
            couponsNumber: 20
            rangeAge: [1,2]
            officeId: "${officeId}"
          }) {
            id
            title
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

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 1'), tokenMaker);
  //Hunt coupon
  const { body: { data: { captureCoupon } } } = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);

  //Redeem coupon
  await utils.callToQraphql(serverRequest, getRedeemCouponQuery(captureCoupon.code), tokenMaker);

  //My coupons
  const { body: { data: { myRedeemedCoupons } }} = await utils.callToQraphql(serverRequest, myRedeemedCouponsQuery, tokenHunter);

  t.is(myRedeemedCoupons[0].status, 'redeemed');
  t.truthy(myRedeemedCoupons[0].huntedAt);
  t.truthy(myRedeemedCoupons[0].redeemedAt);
});
