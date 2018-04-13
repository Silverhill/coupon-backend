import test from 'ava';
import { connectDB, dropDB } from '../mocks/db';
import request from 'supertest';
import app from '../../server/server';
import utils from '../utils/test.utils'

const hunterLoginQuery = utils.getHunterLoginQuery();
const makerLoginQuery = utils.getMakerLoginQuery();

test.beforeEach('connect with mongodb', async () => {
  await connectDB();
  await utils.createDefaultUsers();
});

test.afterEach.always(async () => {
  await dropDB();
});

test('Campaign: Should get access only maker role', async t => {
  t.plan(3)

  const addCampaignQuery = {
    query: `
      mutation {
        addCampaign(input: {
          title: "Campaign 1"
          country: "Ecuador"
          city: "Loja"
          description: "Description 1"
          address: "Av. Pio Jaramillo"
          customMessage: "a custom message"
          startAt: 1521178272153
          endAt: 1522188672153
          couponsNumber: 20
          initialAgeRange: 18
          finalAgeRange: 50
        }) {
          id
          title
        }
      }
    `
  };

  let serverRequest = request(app);

  const hunterResponse = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const makerResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { data: { signIn: { token: token2 } } } = hunterResponse.body
  const { data: { signIn: { token: token3 } } } = makerResponse.body

  const res2 = await utils.callToQraphql(serverRequest, addCampaignQuery, token2);
  const res3 = await utils.callToQraphql(serverRequest, addCampaignQuery, token3);

  const { body: bodyHunter } = res2;
  const { body: bodyMaker } = res3;

  t.falsy(bodyHunter.data);
  t.truthy(bodyMaker.data);

  const { errors: errors1 } = bodyHunter;

  t.is(errors1[0].message, 'Not have permissions for hunter role.');
});

test('Campaign: Should create a Campaign', async t => {
  t.plan(13)

  const addCampaignQuery = {
    query: `
      mutation {
        addCampaign(input: {
          title: "Campaign 1"
          country: "Ecuador"
          city: "Loja"
          description: "Description 1"
          address: "Av. Pio Jaramillo"
          customMessage: "a custom message"
          startAt: 1521178272153
          endAt: 1522188672153
          couponsNumber: 20
          initialAgeRange: 18
          finalAgeRange: 50
        }) {
          id
          title
          country
          city
          description
          customMessage
          address
          startAt
          endAt
          totalCoupons
          huntedCoupons
          redeemedCoupons
          deleted
        }
      }
    `
  };

  let serverRequest = request(app)
  const loginResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { data: { signIn: { token } } } = loginResponse.body

  const addCampaignResponse = await utils.callToQraphql(serverRequest, addCampaignQuery, token);

  t.is(addCampaignResponse.status, 200);

  const { body: { data: { addCampaign } } } = addCampaignResponse;

  t.is(addCampaign.title, 'Campaign 1');
  t.is(addCampaign.country, 'Ecuador');
  t.is(addCampaign.city, 'Loja');
  t.is(addCampaign.description, 'Description 1');
  t.is(addCampaign.customMessage, 'a custom message');
  t.is(addCampaign.address, 'Av. Pio Jaramillo');
  t.is(addCampaign.startAt, 1521178272153);
  t.is(addCampaign.endAt, 1522188672153);
  t.is(addCampaign.totalCoupons, 20);
  t.is(addCampaign.huntedCoupons, 0);
  t.is(addCampaign.redeemedCoupons, 0);
  t.is(addCampaign.deleted, false);
});

test('Campaign: endAt should be greater than startAt', async t => {
  t.plan(2)
  const addCampaignQuery = {
    query: `
      mutation {
        addCampaign(input: {
          title: "Campaign 1"
          country: "Ecuador"
          city: "Loja"
          description: "Description 1"
          address: "Av. Pio Jaramillo"
          startAt: 1522188672153
          endAt: 1521178272153
          couponsNumber: 20
          initialAgeRange: 18
          finalAgeRange: 50
        }) {
          id
          title
        }
      }
    `
  };

  let serverRequest = request(app)
  const loginResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { data: { signIn: { token } } } = loginResponse.body
  const addCampaignResponse = await utils.callToQraphql(serverRequest, addCampaignQuery, token);

  t.is(addCampaignResponse.status, 200);

  const { body: { errors } } = addCampaignResponse;

  t.is(errors[0].message, 'endAt should be greater than startAt.');
});

test('Campaign: Should update a Campaign', async t => {
  t.plan(3);
  const addCampaignQuery = {
    query: `
      mutation {
        addCampaign(input: {
          title: "Campaign 1"
          country: "Ecuador"
          city: "Loja"
          description: "Description 1"
          address: "Av. Pio Jaramillo"
          startAt: 1521178272153
          endAt: 1522188672153
          couponsNumber: 20
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

  function getUpdateCampaignQuery(id) {

    return {
      query: `
        mutation {
          updateCampaign(input: {
            id: "${id}"
            title: "Campaign updated"
          }) {
            id
            title
            deleted
          }
        }
      `
    };
  }

  let serverRequest = request(app)
  const loginResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { data: { signIn: { token } } } = loginResponse.body
  const addCampaignResponse = await utils.callToQraphql(serverRequest, addCampaignQuery, token);
  const { body: { data: { addCampaign } } } = addCampaignResponse;
  const updateCampaignResponse = await utils.callToQraphql(serverRequest, getUpdateCampaignQuery(addCampaign.id), token);
  t.is(updateCampaignResponse.status, 200);

  const { body: { data: { updateCampaign } } } = updateCampaignResponse;

  t.is(updateCampaign.title, 'Campaign updated');
  t.is(updateCampaign.deleted, false);
});

test('Campaign: Should delete a Campaign', async t => {
  t.plan(2);
  const addCampaignQuery = {
    query: `
      mutation {
        addCampaign(input: {
          title: "Campaign 1"
          country: "Ecuador"
          city: "Loja"
          description: "Description 1"
          address: "Av. Pio Jaramillo"
          startAt: 1521178272153
          endAt: 1522188672153
          couponsNumber: 20
          initialAgeRange: 18
          finalAgeRange: 50
        }) {
          id
          title
        }
      }
    `
  };

  function getDeleteCampaignQuery(id) {
    return {
      query: `
        mutation {
          deleteCampaign(input: {
            id: "${id}"
          }) {
            id
            deleted
          }
        }
      `
    };
  }

  let serverRequest = request(app)
  const loginResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { data: { signIn: { token } } } = loginResponse.body
  const addCampaignResponse = await utils.callToQraphql(serverRequest, addCampaignQuery, token);
  const { body: { data: { addCampaign } } } = addCampaignResponse;
  const deleteCampaignResponse = await utils.callToQraphql(serverRequest, getDeleteCampaignQuery(addCampaign.id), token);
  t.is(deleteCampaignResponse.status, 200);

  const { body: { data: { deleteCampaign } } } = deleteCampaignResponse;

  t.is(deleteCampaign.deleted, true);

})

test('Campaign: Should get a Campaign', async t => {
  t.plan(3);

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
          couponsNumber: 20
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

  function getCampaignQuery(id) {
    return {
      query: `
        {
          campaign(id: "${id}") {
            id
            title
            status
          }
        }
      `
    }
  }

  let serverRequest = request(app)
  const loginResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { data: { signIn: { token } } } = loginResponse.body
  const addCampaignResponse = await utils.callToQraphql(serverRequest, addCampaignQuery, token);
  const { body: { data: { addCampaign } } } = addCampaignResponse;
  const campaignResponse = await utils.callToQraphql(serverRequest, getCampaignQuery(addCampaign.id), token);

  t.is(campaignResponse.status, 200);

  const { body: { data: { campaign } } } = campaignResponse;

  t.is(campaign.title, 'Campaign test 1');
  t.is(campaign.status, 'unavailable');

})

test('Campaign: Should get all campaigns', async t => {
  t.plan(4);

  const addCampaignQuery1 = {
    query: `
      mutation {
        addCampaign(input: {
          title: "Campaign 1"
          country: "Ecuador"
          city: "Loja"
          description: "Description 1"
          address: "Av. Pio Jaramillo"
          startAt: 1521178272153
          endAt: 1522188672153
          couponsNumber: 20
          initialAgeRange: 18
          finalAgeRange: 50
        }) {
          id
          title
        }
      }
    `
  };

  const addCampaignQuery2 = {
    query: `
      mutation {
        addCampaign(input: {
          title: "Campaign 2"
          country: "Ecuador"
          city: "Loja"
          description: "Description 1"
          address: "Av. Pio Jaramillo"
          startAt: 1521178272153
          endAt: 1522188672153
          couponsNumber: 20
          initialAgeRange: 18
          finalAgeRange: 50
        }) {
          id
          title
        }
      }
    `
  };

  const myCampaignsQuery = {
    query: `
      {
        myCampaigns {
          id
          title
        }
      }
    `
  };

  let serverRequest = request(app)
  const loginResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { data: { signIn: { token } } } = loginResponse.body
  await utils.callToQraphql(serverRequest, addCampaignQuery1, token);
  await utils.callToQraphql(serverRequest, addCampaignQuery2, token);

  const myCampaignsResponse = await utils.callToQraphql(serverRequest, myCampaignsQuery, token);

  t.is(myCampaignsResponse.status, 200);

  const { body: { data: { myCampaigns } } } = myCampaignsResponse;

  t.is(myCampaigns.length, 2);
  t.is(myCampaigns[0].title, 'Campaign 1');
  t.is(myCampaigns[1].title, 'Campaign 2');

})

test('Campaign: Should add coupons to campaign', async t => {
  t.plan(4);

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
          couponsNumber: 10
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

  let serverRequest = request(app)
  const loginResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { data: { signIn: { token } } } = loginResponse.body
  const addCampaignResponse = await utils.callToQraphql(serverRequest, addCampaignQuery, token);
  const { body: { data: { addCampaign } } } = addCampaignResponse;
  const couponsFromCampaignResponse = await utils.callToQraphql(serverRequest, getCouponsFromCampaignQuery(addCampaign.id), token);
  t.is(couponsFromCampaignResponse.status, 200);

  const { body: { data: { couponsFromCampaign } } } = couponsFromCampaignResponse;
  t.is(couponsFromCampaign.length, 10);
  t.truthy(couponsFromCampaign[0].id);
  t.truthy(couponsFromCampaign[9].id);

})

test('Campaign: Should validate if there are hunted coupons and prevent delete the campaign', async t => {
  t.plan(3);

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
          couponsNumber: 20
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

  function getDeleteCampaignQuery(id) {
    return {
      query: `
        mutation {
          deleteCampaign(input: {
            id: "${id}"
          }) {
            id
            deleted
          }
        }
      `
    };
  }

  let serverRequest = request(app)
  const loginResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { data: { signIn: { token: tokenMaker } } } = loginResponse.body
  const loginResponse2 = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { data: { signIn: { token: tokenHunter } } } = loginResponse2.body

  const addCampaignResponse = await utils.callToQraphql(serverRequest, addCampaignQuery, tokenMaker);
  const { body: { data: { addCampaign } } } = addCampaignResponse;
  const captureCouponResponse = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);
  t.is(captureCouponResponse.status, 200);

  const deleteCampaignResponse = await utils.callToQraphql(serverRequest, getDeleteCampaignQuery(addCampaign.id), tokenMaker);
  t.is(deleteCampaignResponse.status, 200);

  const { body: { errors } } = deleteCampaignResponse;
  t.is(errors[0].message, 'This campaign can not be deleted because there are coupons hunted.');
})
