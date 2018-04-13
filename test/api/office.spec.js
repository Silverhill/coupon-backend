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
  t.is(addOffice.ruc, '1132569976001');
  t.is(addOffice.legalRepresentative, 'Juan Perez');
  t.is(addOffice.economicActivity, 'Comida');

});

test('Office: myOffices > Should get my Offices', async t => {
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

  const myOfficesQuery = {
    query: `
      {
        myOffices {
          id
          ruc
        }
      }
    `
  };

  function getAddOfficeQuery(companyId, name) {
    return {
      query: `
        mutation {
          addOffice(input: {
            ruc: "1132569976001"
            economicActivity: "Comida"
            contributorType: "Natural"
            legalRepresentative: "Juan Perez"
            name: "${name}"
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

  await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id, 'sucursal 1'), tokenMaker);
  await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id, 'sucursal 2'), tokenMaker);

  const myOfficesResponse = await utils.callToQraphql(serverRequest, myOfficesQuery, tokenMaker);

  const { body: { data: { myOffices } } } = myOfficesResponse;

  t.truthy(myOffices);
  t.is(myOffices.length, 2);
});
