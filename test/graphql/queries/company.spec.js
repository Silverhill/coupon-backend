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

test('Company: myCompany > Should get access only maker role', async t => {
  t.plan(2)

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


  const myCompanyQuery = {
    query: `
      {
        myCompany {
          id
          businessName
        }
      }
    `
  };

  let serverRequest = request(app);

  const hunterResponse = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const makerResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { data: { signIn: { token: token2 } } } = hunterResponse.body;
  const { data: { signIn: { token: token3 } } } = makerResponse.body;

  await utils.callToQraphql(serverRequest, addCompanyQuery, token3);

  const res2 = await utils.callToQraphql(serverRequest, myCompanyQuery, token2);
  const res3 = await utils.callToQraphql(serverRequest, myCompanyQuery, token3);

  const { body: bodyHunter } = res2;
  const { body: bodyMaker } = res3;

  t.truthy(bodyMaker.data.myCompany);
  const { errors } = bodyHunter;
  t.is(errors[0].message, 'Not have permissions for hunter role.');
});

test('Company: myCompany > Should get null if there is no company', async t => {
  t.plan(2)

  const myCompanyQuery = {
    query: `
      {
        myCompany {
          id
          businessName
        }
      }
    `
  };

  let serverRequest = request(app);
  const loginResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { data: { signIn: { token: tokenMaker } } } = loginResponse.body;
  const { body: { data, errors } } = await utils.callToQraphql(serverRequest, myCompanyQuery, tokenMaker);

  t.is(data.myCompany, null);
  t.falsy(errors);
});
