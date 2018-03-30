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

test('Campaign: Should get access only maker role', async t => {
  t.plan(4)

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
        }) {
          _id
          title
        }
      }
    `
  };

  let serverRequest = request(app);

  const adminResponse = await utils.callToQraphql(serverRequest, adminLoginQuery);
  const hunterResponse = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const makerResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { data: { signIn: { token: token1 } } } = adminResponse.body
  const { data: { signIn: { token: token2 } } } = hunterResponse.body
  const { data: { signIn: { token: token3 } } } = makerResponse.body

  const res1 = await utils.callToQraphql(serverRequest, addCampaignQuery, token1);
  const res2 = await utils.callToQraphql(serverRequest, addCampaignQuery, token2);
  const res3 = await utils.callToQraphql(serverRequest, addCampaignQuery, token3);

  const { body: bodyAdmin } = res1;
  const { body: bodyHunter } = res2;
  const { body: bodyMaker } = res3;

  t.truthy(bodyAdmin.data);
  t.falsy(bodyHunter.data);
  t.truthy(bodyMaker.data);

  const { errors: errors1 } = bodyHunter;

  t.is(errors1[0].message, 'Not have permissions for hunter role.');
});

test('Campaign: Should create a Campaign', async t => {
  t.plan(10)

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
        }) {
          _id
          title
          country
          city
          description
          address
          startAt
          endAt
          couponsNumber
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
  t.is(addCampaign.address, 'Av. Pio Jaramillo');
  t.is(addCampaign.startAt, 1521178272153);
  t.is(addCampaign.endAt, 1522188672153);
  t.is(addCampaign.couponsNumber, 20);
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
        }) {
          _id
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
        }) {
          _id
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
            _id
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
  const updateCampaignResponse = await utils.callToQraphql(serverRequest, getUpdateCampaignQuery(addCampaign._id), token);
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
        }) {
          _id
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
            _id
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
  const deleteCampaignResponse = await utils.callToQraphql(serverRequest, getDeleteCampaignQuery(addCampaign._id), token);
  t.is(deleteCampaignResponse.status, 200);

  const { body: { data: { deleteCampaign } } } = deleteCampaignResponse;

  t.is(deleteCampaign.deleted, true);

})

test('Campaign: Should get a Campaign', async t => {
  t.plan(2);

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
        }) {
          _id
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
            _id
            title
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
  const campaignResponse = await utils.callToQraphql(serverRequest, getCampaignQuery(addCampaign._id), token);

  t.is(campaignResponse.status, 200);

  const { body: { data: { campaign } } } = campaignResponse;

  t.is(campaign.title, 'Campaign test 1');

})
