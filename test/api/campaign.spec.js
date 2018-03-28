import test from 'ava';
import { connectDB, dropDB } from '../mocks/db';
import request from 'supertest';
import app from '../../server/server';
import utils from '../utils/test.utils'

const adminLoginQuery = utils.getAdminLoginQuery();

test.beforeEach('connect with mongodb', async () => {
  await connectDB();
  await utils.createDefaultUsers();
});

test.afterEach.always(async () => {
  await dropDB();
});

test('Campaign: Should get access only admin role', async t => {
  t.plan(5)

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

  let serverRequest = request(app)

  const hunterLoginQuery = utils.getHunterLoginQuery();
  const makerLoginQuery = utils.getMakerLoginQuery();

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
  t.falsy(bodyMaker.data);

  const { errors: errors1 } = bodyHunter;
  const { errors: errors2 } = bodyMaker;

  t.is(errors1[0].message, 'Not have permissions for hunter role.');
  t.is(errors2[0].message, 'Not have permissions for maker role.');
});

test('Campaign: Should create a Campaign', async t => {
  t.plan(9)

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
        }
      }
    `
  };

  let serverRequest = request(app)
  const loginResponse = await utils.callToQraphql(serverRequest, adminLoginQuery);

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
});
