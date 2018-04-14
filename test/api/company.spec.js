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

test('Company: addCompany > Should get access only maker role', async t => {
  t.plan(3)

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

  let serverRequest = request(app);

  const hunterResponse = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const makerResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { data: { signIn: { token: token2 } } } = hunterResponse.body;
  const { data: { signIn: { token: token3 } } } = makerResponse.body;

  const res2 = await utils.callToQraphql(serverRequest, addCompanyQuery, token2);
  const res3 = await utils.callToQraphql(serverRequest, addCompanyQuery, token3);

  const { body: bodyHunter } = res2;
  const { body: bodyMaker } = res3;

  t.falsy(bodyHunter.data);
  t.truthy(bodyMaker.data);

  const { errors } = bodyHunter;
  t.is(errors[0].message, 'Not have permissions for hunter role.');
});

test('Company: addCompany > Should create a Company', async t => {
  t.plan(3)

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

  let serverRequest = request(app);
  const loginResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { data: { signIn: { token: tokenMaker } } } = loginResponse.body
  const addCompanyResponse = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  t.is(addCompanyResponse.status, 200);

  const { body: { data: { addCompany } } } = addCompanyResponse;

  t.truthy(addCompany.id);
  t.is(addCompany.businessName, 'Fogon Grill');
});

test('Company: addCompany > Should return an error if I try to create another company', async t => {
  t.plan(3)

  const addCompanyQuery1 = {
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

  const addCompanyQuery2 = {
    query: `
      mutation {
        addCompany(input: {
          businessName: "Carbonero"
        }) {
          id
          businessName
        }
      }
    `
  };

  let serverRequest = request(app);
  const loginResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { data: { signIn: { token: tokenMaker } } } = loginResponse.body
  const addCompanyResponse1 = await utils.callToQraphql(serverRequest, addCompanyQuery1, tokenMaker);
  t.is(addCompanyResponse1.status, 200);

  const addCompanyResponse2 = await utils.callToQraphql(serverRequest, addCompanyQuery2, tokenMaker);
  t.is(addCompanyResponse2.status, 200);

  const { body: { errors } } = addCompanyResponse2;

  t.is(errors[0].message, 'Only one company can be created.');
});

test('Company: myCompany > Should get access only maker role', async t => {
  t.plan(3)

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

  t.falsy(bodyHunter.data);
  t.truthy(bodyMaker.data);

  const { errors } = bodyHunter;
  t.is(errors[0].message, 'Not have permissions for hunter role.');
});

test('Company: addCompany > Should get a Company', async t => {
  t.plan(3)

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
  const loginResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { data: { signIn: { token: tokenMaker } } } = loginResponse.body;
  await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const myCompanyResponse = await utils.callToQraphql(serverRequest, myCompanyQuery, tokenMaker);
  t.is(myCompanyResponse.status, 200);

  const { body: { data: { myCompany } } } = myCompanyResponse;

  t.truthy(myCompany.id);
  t.is(myCompany.businessName, 'Fogon Grill');
});
