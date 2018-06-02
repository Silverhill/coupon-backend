import test from 'ava';
import { connectDB, dropDB } from '../../mocks/db';
import request from 'supertest';
import app from '../../../server/server';
import utils from '../../utils/test.utils'
import sleep from 'then-sleep';

const hunterLoginQuery = utils.getHunterLoginQuery();
const hunterLoginQuery2 = utils.getHunterLoginQuery2();
const hunterLoginQuery3 = utils.getHunterLoginQuery3();
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

test('Campaign: campaign > Should get a Campaign', async t => {
  t.plan(5);

  function getAddCampaignQuery(officeId) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "Campaign test 1"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            startAt: 1521178272153
            endAt: 1522188672153
            couponsNumber: 20
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

  function getCampaignQuery(id) {
    return {
      query: `
        {
          campaign(id: "${id}") {
            id
            title
            office {
              id
              name
            }
          }
        }
      `
    }
  }

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);
  const campaignResponse = await utils.callToQraphql(serverRequest, getCampaignQuery(addCampaign.id), tokenMaker);
  t.is(campaignResponse.status, 200);

  const { body: { data: { campaign } } } = campaignResponse;
  t.truthy(campaign.id)
  t.is(campaign.title, 'Campaign test 1');
  t.truthy(campaign.office.id);
  t.is(campaign.office.name, 'Fogon Grill sucursal 1');
})

test('Campaign: Hunter: allCampaigns > Should get all campaigns', async t => {
  t.plan(9);
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

  const allCampaignsQuery = {
    query: `
        {
          allCampaigns {
            totalCount
            campaigns{
              title
              couponsHuntedByMe
              couponsRedeemedByMe
            }
          }
        }
      `
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
  //Hunt coupon
  await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 1'), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 2'), tokenMaker);
  const { body: { data: { captureCoupon } } } = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);

  //Redeem coupon
  await utils.callToQraphql(serverRequest, getRedeemCouponQuery(captureCoupon.code), tokenMaker);

  const allCampaignsResponse = await utils.callToQraphql(serverRequest, allCampaignsQuery, tokenHunter);
  t.is(allCampaignsResponse.status, 200);

  const { body: { data: { allCampaigns } } } = allCampaignsResponse;
  t.is(allCampaigns.campaigns.length, 2);
  t.is(allCampaigns.totalCount, 2);
  t.is(allCampaigns.campaigns[0].title, 'Campaign 1');
  t.is(allCampaigns.campaigns[0].couponsHuntedByMe, 0);
  t.is(allCampaigns.campaigns[0].couponsRedeemedByMe, 0);
  t.is(allCampaigns.campaigns[1].title, 'Campaign 2');
  t.is(allCampaigns.campaigns[1].couponsHuntedByMe, 1);
  t.is(allCampaigns.campaigns[1].couponsRedeemedByMe, 1);
});

test('Campaign: Hunter: allCampaigns > Should get all campaigns with the flag canHunt', async t => {
  t.plan(4);
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

  const allCampaignsQuery = {
    query: `
        {
          allCampaigns {
            totalCount
            campaigns{
              title
              canHunt
            }
          }
        }
      `
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
  //Campaign 1
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 1'), tokenMaker);
  //Campaign 2
  await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 2'), tokenMaker);
  //Hunt coupon in Campaign 1
  const { body: { data: { captureCoupon } } } = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);
  const { body: { data: { allCampaigns: allCampaigns1 } } } = await utils.callToQraphql(serverRequest, allCampaignsQuery, tokenHunter);

  //Redeem coupon in Campaign 1
  await utils.callToQraphql(serverRequest, getRedeemCouponQuery(captureCoupon.code), tokenMaker);
  const { body: { data: { allCampaigns: allCampaigns2 } } } = await utils.callToQraphql(serverRequest, allCampaignsQuery, tokenHunter);

  t.is(allCampaigns1.campaigns.length, 2);
  t.is(allCampaigns2.campaigns.length, 2);
  t.false(allCampaigns1.campaigns[0].canHunt);
  t.true(allCampaigns2.campaigns[1].canHunt);
});

test('Campaign: Hunter: allCampaigns > Return empty array if there is not coupons', async t => {
  t.plan(8);
  function getAddCampaignQuery(officeId, title) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "${title}"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            startAt: 1521178272153
            endAt: 1522188672153
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

  const allCampaignsQuery = {
    query: `
        {
          allCampaigns {
            totalCount
            campaigns{
              title
              couponsHuntedByMe
            }
          }
        }
      `
  }

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 1'), tokenMaker);
  await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 2'), tokenMaker);
  await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 3'), tokenMaker);

  const { body: { data: { allCampaigns } } } = await utils.callToQraphql(serverRequest, allCampaignsQuery, tokenHunter);

  t.is(allCampaigns.campaigns.length, 3);
  t.is(allCampaigns.totalCount, 3);
  t.is(allCampaigns.campaigns[0].title, 'Campaign 1');
  t.is(allCampaigns.campaigns[0].couponsHuntedByMe, 0);
  t.is(allCampaigns.campaigns[1].title, 'Campaign 2');
  t.is(allCampaigns.campaigns[1].couponsHuntedByMe, 0);
  t.is(allCampaigns.campaigns[2].title, 'Campaign 3');
  t.is(allCampaigns.campaigns[2].couponsHuntedByMe, 0);
});

test('Campaign: Maker: myCampaigns > Should get my campaigns', async t => {
  t.plan(4);

  function getAddCampaignQuery(officeId, title) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "${title}"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            startAt: 1521178272153
            endAt: 1522188672153
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

  const myCampaignsQuery = {
    query: `
    {
      myCampaigns{
        campaigns{
          id
          title
        }
        totalCount
      }
    }
    `
  };

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 1'), tokenMaker);
  await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 2'), tokenMaker);

  const myCampaignsResponse = await utils.callToQraphql(serverRequest, myCampaignsQuery, tokenMaker);
  t.is(myCampaignsResponse.status, 200);

  const { body: { data: { myCampaigns } } } = myCampaignsResponse;
  t.is(myCampaigns.campaigns.length, 2);
  t.is(myCampaigns.campaigns[0].title, 'Campaign 1');
  t.is(myCampaigns.campaigns[1].title, 'Campaign 2');

})

test('Campaign: huntedCouponsByCampaign > Should get an empty array if there are no hunted coupons', async t => {
  t.plan(2);

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
            couponsNumber: 10
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

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);
  const huntedCouponsByCampaignResponse = await utils.callToQraphql(serverRequest, getHuntedCouponsByCampaignQuery(addCampaign.id), tokenMaker);

  const { body: { data, errors } } = huntedCouponsByCampaignResponse;
  t.deepEqual(data.huntedCouponsByCampaign, []);
  t.falsy(errors)
})

test('Campaign: huntersByCampaign > should get the hunter list of a specific campaign', async t => {
  t.plan(4)

  function getHuntersByCampaign(campaignId) {
    return {
      query: `
        {
          huntersByCampaign(campaignId: "${campaignId}") {
            id
            name
          }
        }
      `
    };
  }

  function getAddCampaignQuery(officeId, title, couponsNumber) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "${title}"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            customMessage: "a custom message"
            startAt: ${Date.now()}
            endAt: ${Date.now() + 7200000}
            couponsNumber: ${couponsNumber}
            rangeAge: [1,2]
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
  const { body: { data: { signIn: { token: tokenHunter1 } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { signIn: { token: tokenHunter2 } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery2);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign: campaign1 } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 1', 10), tokenMaker);
  const { body: { data: { addCampaign: campaign2 } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 2', 20), tokenMaker);

  // capture coupons
  await utils.callToQraphql(serverRequest, getCaptureCouponQuery(campaign1.id), tokenHunter1);
  await utils.callToQraphql(serverRequest, getCaptureCouponQuery(campaign2.id), tokenHunter2);

  const { body: { data: { huntersByCampaign: h1 } } } = await utils.callToQraphql(serverRequest, getHuntersByCampaign(campaign1.id), tokenMaker);
  const { body: { data: { huntersByCampaign: h2 } } } = await utils.callToQraphql(serverRequest, getHuntersByCampaign(campaign2.id), tokenMaker);

  t.is(h1.length, 1)
  t.is(h1[0].name, 'Hunter')
  t.is(h2.length, 1)
  t.is(h2[0].name, 'Hunter2')
});

test('Campaign: huntersByCampaign > should get an empty array if there are no hunters in a specific campaign', async t => {
  t.plan(2)

  function getHuntersByCampaign(campaignId) {
    return {
      query: `
        {
          huntersByCampaign(campaignId: "${campaignId}") {
            id
            name
          }
        }
      `
    };
  }

  function getAddCampaignQuery(officeId, title, couponsNumber) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "${title}"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            customMessage: "a custom message"
            startAt: ${Date.now()}
            endAt: ${Date.now() + 7200000}
            couponsNumber: ${couponsNumber}
            rangeAge: [1,2]
            officeId: "${officeId}"
          }) {
            id
          }
        }
      `
    }
  }

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign: campaign1 } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 1', 10), tokenMaker);

  const { body: { data, errors } } = await utils.callToQraphql(serverRequest, getHuntersByCampaign(campaign1.id), tokenMaker);

  t.deepEqual(data.huntersByCampaign, [])
  t.falsy(errors)
});

test('Campaign: addCampaign > should have status: unavailable', async t => {
  function getAddCampaignQuery(officeId) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "Campaign 1"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            customMessage: "a custom message"
            startAt: ${Date.now() + 3600000 /* 1 hour */}
            endAt: ${Date.now() + 7200000 /* 2 hours */}
            couponsNumber: 10
            rangeAge: [1,2]
            officeId: "${officeId}"
          }) {
            id
            status
          }
        }
      `
    };
  }

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);
  t.is(addCampaign.status, 'unavailable')
});

test('Campaign: campaign > should have status: available', async t => {
  t.plan(1);
  function getAddCampaignQuery(officeId) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "Campaign 1"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            customMessage: "a custom message"
            startAt: ${Date.now()}
            endAt: ${Date.now() + 7200000 /* 2 hours */}
            couponsNumber: 10
            rangeAge: [1,2]
            officeId: "${officeId}"
          }) {
            id
            status
          }
        }
      `
    };
  }

  function getCampaignQuery(id) {
    return {
      query: `
        {
          campaign(id: "${id}") {
            id
            status
          }
        }
      `
    }
  }

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);
  await sleep(1000);
  const { body: { data: { campaign } } } = await utils.callToQraphql(serverRequest, getCampaignQuery(addCampaign.id), tokenMaker);
  t.is(campaign.status, 'available');
});

test('Campaign: campaign > should have status: expired', async t => {
  t.plan(1);
  function getAddCampaignQuery(officeId) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "Campaign 1"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            customMessage: "a custom message"
            startAt: ${Date.now()}
            endAt: ${Date.now() + 1}
            couponsNumber: 10
            rangeAge: [1,2]
            officeId: "${officeId}"
          }) {
            id
            status
          }
        }
      `
    };
  }

  function getCampaignQuery(id) {
    return {
      query: `
        {
          campaign(id: "${id}") {
            id
            status
          }
        }
      `
    }
  }

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);
  await sleep(1000);
  const { body: { data: { campaign } } } = await utils.callToQraphql(serverRequest, getCampaignQuery(addCampaign.id), tokenMaker);
  t.is(campaign.status, 'expired');
});

test('Campaign: campaign > should have status: soldout', async t => {
  t.plan(1);
  function getAddCampaignQuery(officeId) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "Campaign 1"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            customMessage: "a custom message"
            startAt: ${Date.now()}
            endAt: ${Date.now() + 7200000}
            couponsNumber: 3
            rangeAge: [1,2]
            officeId: "${officeId}"
          }) {
            id
            status
          }
        }
      `
    };
  }

  function getCampaignQuery(id) {
    return {
      query: `
        {
          campaign(id: "${id}") {
            id
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

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { signIn: { token: tokenHunter1 } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { signIn: { token: tokenHunter2 } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery2);
  const { body: { data: { signIn: { token: tokenHunter3 } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery3);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);
  // capture coupon 1
  await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter1);
  // capture coupon 2
  await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter2);
  // capture coupon 3
  await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter3);

  const { body: { data: { campaign } } } = await utils.callToQraphql(serverRequest, getCampaignQuery(addCampaign.id), tokenMaker);
  t.is(campaign.status, 'soldout');
});

test('Campaign: Hunter: allCampaigns > Should get all campaigns even if there are no coupons hunted', async t => {
  t.plan(6);
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

  const allCampaignsQuery = {
    query: `
      {
        allCampaigns {
          campaigns {
            id
            title
            couponsHuntedByMe
          }
          totalCount
        }
      }
    `
  }

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 1'), tokenMaker);
  await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 2'), tokenMaker);

  const { body: { data: { allCampaigns } } } = await utils.callToQraphql(serverRequest, allCampaignsQuery, tokenHunter);

  t.is(allCampaigns.campaigns.length, 2);
  t.is(allCampaigns.totalCount, 2);
  t.is(allCampaigns.campaigns[0].title, 'Campaign 1');
  t.is(allCampaigns.campaigns[0].couponsHuntedByMe, 0);
  t.is(allCampaigns.campaigns[1].title, 'Campaign 2');
  t.is(allCampaigns.campaigns[1].couponsHuntedByMe, 0);
});

test('Campaign: Public: publicCampaigns > Should get public campaigns', async t => {
  t.plan(12);
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

  const publicCampaignsQuery = {
    query: `
        {
          publicCampaigns {
            totalCount
            campaigns {
              id
              startAt
              endAt
              country
              city
              image
              totalCoupons
              huntedCoupons
              redeemedCoupons
              status
              title
              description
              customMessage
              deleted
              rangeAge
              remainingCoupons
              createdAt
              office {
                id
                economicActivity
                contributorType
                legalRepresentative
                name
                officePhone
                cellPhone
                address
                email
                company {
                  id
                  businessName
                  logo
                  slogan
                }
              }
            }
          }
        }
      `
  }

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  //Hunt coupon
  await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 1'), tokenMaker);
  await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 2'), tokenMaker);
  await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 3'), tokenMaker);

  const publicCampaignsResponse = await utils.callToQraphql(serverRequest, publicCampaignsQuery);
  t.is(publicCampaignsResponse.status, 200);

  const { body: { data: { publicCampaigns } } } = publicCampaignsResponse;
  t.is(publicCampaigns.campaigns.length, 3);
  t.is(publicCampaigns.totalCount, 3);
  t.is(publicCampaigns.campaigns[0].title, 'Campaign 1');
  t.is(publicCampaigns.campaigns[0].office.name, 'Fogon Grill sucursal 1');
  t.is(publicCampaigns.campaigns[0].office.company.businessName, 'Fogon Grill');
  t.is(publicCampaigns.campaigns[1].title, 'Campaign 2');
  t.is(publicCampaigns.campaigns[1].office.name, 'Fogon Grill sucursal 1');
  t.is(publicCampaigns.campaigns[1].office.company.businessName, 'Fogon Grill');
  t.is(publicCampaigns.campaigns[2].title, 'Campaign 3');
  t.is(publicCampaigns.campaigns[2].office.name, 'Fogon Grill sucursal 1');
  t.is(publicCampaigns.campaigns[2].office.company.businessName, 'Fogon Grill');
});

test('Campaign: Hunter: campaignsByMakerId > Should return the campaigns by Maker', async t => {
  t.plan(9);
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

  function getCampaignsByMakerIdQuery(makerId) {
    return {
      query: `
        {
          campaignsByMakerId(makerId:"${makerId}") {
            id
            title
            status
            country
            city
            image
            totalCoupons
            huntedCoupons
            redeemedCoupons
            description
            rangeAge
            couponsHuntedByMe
            couponsRedeemedByMe
            canHunt
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

  const meQuery = {
    query: `
      {
        me {
          id
        }
      }
    `
  }

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 1'), tokenMaker);
  await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 2'), tokenMaker);
  await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);
  const { body: { data: { me: makerData } } } = await utils.callToQraphql(serverRequest, meQuery, tokenMaker);
  const { body: { data: { campaignsByMakerId } } } = await utils.callToQraphql(serverRequest, getCampaignsByMakerIdQuery(makerData.id), tokenHunter);

  t.is(campaignsByMakerId.length, 2);
  t.is(campaignsByMakerId[0].title, 'Campaign 1');
  t.is(campaignsByMakerId[0].couponsHuntedByMe, 1);
  t.is(campaignsByMakerId[0].couponsRedeemedByMe, 0);
  t.false(campaignsByMakerId[0].canHunt);
  t.is(campaignsByMakerId[1].title, 'Campaign 2');
  t.is(campaignsByMakerId[1].couponsHuntedByMe, 0);
  t.is(campaignsByMakerId[1].couponsRedeemedByMe, 0)
  t.true(campaignsByMakerId[1].canHunt);
})

test('Campaign: Hunter: campaignsByMakerId > Should return the campaigns by Maker with Company and Office', async t => {
  t.plan(5);
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

  function getCampaignsByMakerIdQuery(makerId) {
    return {
      query: `
        {
          campaignsByMakerId(makerId:"${makerId}") {
            id
            office {
              id
              name
              company {
                id
                businessName
              }
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

  const meQuery = {
    query: `
      {
        me {
          id
        }
      }
    `
  }

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 1'), tokenMaker);
  await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 2'), tokenMaker);
  await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);
  const { body: { data: { me: makerData } } } = await utils.callToQraphql(serverRequest, meQuery, tokenMaker);
  const { body: { data: { campaignsByMakerId } } } = await utils.callToQraphql(serverRequest, getCampaignsByMakerIdQuery(makerData.id), tokenHunter);

  t.is(campaignsByMakerId.length, 2);
  t.is(campaignsByMakerId[0].office.name, 'Fogon Grill sucursal 1');
  t.is(campaignsByMakerId[0].office.company.businessName, 'Fogon Grill');
  t.is(campaignsByMakerId[1].office.name, 'Fogon Grill sucursal 1');
  t.is(campaignsByMakerId[1].office.company.businessName, 'Fogon Grill');
})
