import test from 'ava';
import { connectDB, dropDB } from '../mocks/db';
import request from 'supertest';
import app from '../../server/server';
import utils from '../utils/test.utils'

const adminLoginQuery = utils.getAdminLoginQuery();
const hunterLoginQuery = utils.getHunterLoginQuery();
const makerLoginQuery = utils.getMakerLoginQuery();

test.beforeEach('connect with mongodb', async () => {
  await connectDB();
  await utils.createDefaultUsers();
});

test.afterEach.always(async () => {
  await dropDB();
});

const addCampaignQuery = {
  query: `
    mutation {
      addCampaign(input: {
        title: "Campaign test 1"
        country: "Ecuador"
        city: "Loja"
        description: "Description 1"
        address: "Av. Pio Jaramillo"
        startAt: 1521178272153
        endAt: 1522188672153
        couponsNumber: 15
        initialAgeRange: 18
        finalAgeRange: 50
      }) {
        id
        title
        deleted
      }
    }
  `
};

test('Coupon > couponsFromCampaign: Should get access only hunter role', async t => {
  t.plan(4)

  function getCouponsFromCampaignQuery(id) {
    return {
      query: `
        {
          couponsFromCampaign(campaignId: "${id}") {
            id
            code
            status
          }
        }
      `
    }
  }

  let serverRequest = request(app);

  const adminResponse = await utils.callToQraphql(serverRequest, adminLoginQuery);
  const hunterResponse = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const makerResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { data: { signIn: { token: token1 } } } = adminResponse.body
  const { data: { signIn: { token: token2 } } } = hunterResponse.body
  const { data: { signIn: { token: token3 } } } = makerResponse.body

  const addCampaignResponse = await utils.callToQraphql(serverRequest, addCampaignQuery, token3);
  const { body: { data: { addCampaign } } } = addCampaignResponse;

  const res1 = await utils.callToQraphql(serverRequest, getCouponsFromCampaignQuery(addCampaign.id), token1);
  const res2 = await utils.callToQraphql(serverRequest, getCouponsFromCampaignQuery(addCampaign.id), token2);
  const res3 = await utils.callToQraphql(serverRequest, getCouponsFromCampaignQuery(addCampaign.id), token3);

  const { body: bodyAdmin } = res1;
  const { body: bodyHunter } = res2;
  const { body: bodyMaker } = res3;

  t.truthy(bodyAdmin.data);
  t.falsy(bodyHunter.data);
  t.truthy(bodyMaker.data);

  const { errors: errors1 } = bodyHunter;
  t.is(errors1[0].message, 'Not have permissions for hunter role.');
});

test('Coupon > captureCoupon: Should get access only hunter role', async t => {
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

  const adminResponse = await utils.callToQraphql(serverRequest, adminLoginQuery);
  const hunterResponse = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const makerResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { data: { signIn: { token: token1 } } } = adminResponse.body;
  const { data: { signIn: { token: token2 } } } = hunterResponse.body;
  const { data: { signIn: { token: token3 } } } = makerResponse.body;

  const addCampaignResponse = await utils.callToQraphql(serverRequest, addCampaignQuery, token3);
  const { body: { data: { addCampaign } } } = addCampaignResponse;

  const res1 = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), token1);
  const res2 = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), token2);
  const res3 = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), token3);

  const { body: bodyAdmin } = res1;
  const { body: bodyHunter } = res2;
  const { body: bodyMaker } = res3;

  t.truthy(bodyAdmin.data);
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
  const loginResponse = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { data: { signIn: { token: tokenHunter } } } = loginResponse.body
  const loginResponse2 = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { data: { signIn: { token: tokenMaker } } } = loginResponse2.body

  const addCampaignResponse = await utils.callToQraphql(serverRequest, addCampaignQuery, tokenMaker);
  const { body: { data: { addCampaign } } } = addCampaignResponse;

  // capture coupon
  const captureCouponResponse = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);
  t.is(captureCouponResponse.status, 200);

  const { body: { data: { captureCoupon: coupon1 } } } = captureCouponResponse;
  t.truthy(coupon1.id);
  t.truthy(coupon1.code);
  t.is(coupon1.status, 'hunted');
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
  const loginResponse = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { data: { signIn: { token: tokenHunter } } } = loginResponse.body
  const loginResponse2 = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { data: { signIn: { token: tokenMaker } } } = loginResponse2.body

  const addCampaignResponse = await utils.callToQraphql(serverRequest, addCampaignQuery, tokenMaker);
  const { body: { data: { addCampaign } } } = addCampaignResponse;

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

  let serverRequest = request(app);
  const loginResponse = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { data: { signIn: { token: tokenHunter } } } = loginResponse.body
  const loginResponse2 = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { data: { signIn: { token: tokenMaker } } } = loginResponse2.body

  const addCampaignResponse = await utils.callToQraphql(serverRequest, addCampaignQuery, tokenMaker);
  const { body: { data: { addCampaign } } } = addCampaignResponse;

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
