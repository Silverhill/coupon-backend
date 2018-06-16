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
  await utils.createDefaultSetting();
});

test.afterEach.always(async () => {
  await dropDB();
});

test('Office: addOffice > Should get access only maker role', async t => {
  t.plan(4)

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


  let serverRequest = request(app);

  const hunterResponse = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const makerResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { data: { signIn: { token: token2 } } } = hunterResponse.body;
  const { data: { signIn: { token: token3 } } } = makerResponse.body;

  const addCompanyResponse = await utils.callToQraphql(serverRequest, addCompanyQuery, token3);
  t.is(addCompanyResponse.status, 200);

  const { body: { data: { addCompany } } } = addCompanyResponse;

  const res2 = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), token2);
  const res3 = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), token3);

  const { body: bodyHunter } = res2;
  const { body: bodyMaker } = res3;

  t.falsy(bodyHunter.data);
  t.truthy(bodyMaker.data);

  const { errors } = bodyHunter;
  t.is(errors[0].message, 'Not have permissions for hunter role.');
});

test('Office: addOffice > Should create a new Office', async t => {
  t.plan(6)

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

  let serverRequest = request(app);
  const loginResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { data: { signIn: { token: tokenMaker } } } = loginResponse.body
  const addCompanyResponse = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  t.is(addCompanyResponse.status, 200);

  const { body: { data: { addCompany } } } = addCompanyResponse;

  const addOfficeResponse = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  t.is(addOfficeResponse.status, 200);

  const { body: { data: { addOffice } } } = addOfficeResponse;

  t.truthy(addOffice.id);
  t.is(addOffice.ruc, '2222222222');
  t.is(addOffice.legalRepresentative, 'Juan Perez');
  t.is(addOffice.economicActivity, 'Comida');

});

test('Office: addOffice > should validate the email format', async t => {
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

  function getAddOfficeQuery(companyId, email) {
    return {
      query: `
        mutation {
          addOffice(input: {
            ruc: "2222222222"
            economicActivity: "Comida"
            contributorType: "Natural"
            legalRepresentative: "Juan Perez"
            name: "Sucursal"
            officePhone: "2567476"
            cellPhone: "0968755643"
            address: "Rocafuerte y Sucre"
            email: "${email}"
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

  let serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenMaker } } } } =  await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);

  const { body: { data: { addOffice: addOffice1 } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id, 'emailvalido@test.com'), tokenMaker);
  t.truthy(addOffice1);

  const { body: { data, errors } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id, 'invalid@mgm@test.com'), tokenMaker);
  t.falsy(data)
  t.is(errors[0].message, 'Office validation failed: email: Invalid email format.');
});
