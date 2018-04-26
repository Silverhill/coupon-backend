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

test('Office: myOffices > Should get an empty array if there is no offices', async t => {
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

  let serverRequest = request(app);
  const loginResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { data: { signIn: { token: tokenMaker } } } = loginResponse.body
  await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const myOfficesResponse = await utils.callToQraphql(serverRequest, myOfficesQuery, tokenMaker);

  const { body: { data, errors } } = myOfficesResponse;

  t.truthy(data.myOffices);
  t.is(data.myOffices.length, 0);
  t.deepEqual(data.myOffices, []);
  t.falsy(errors);
});

test('Office: office > Should get access only maker role', async t => {
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

  function getAddOfficeQuery(companyId, name, ruc) {
    return {
      query: `
        mutation {
          addOffice(input: {
            ruc: "${ruc}"
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

  function getOfficeQuery(officeId) {
    return {
      query: `
        {
          office(id: "${officeId}") {
            id
            ruc
            name
          }
        }
      `
    }
  }

  let serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenMaker } } } } =  await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { signIn: { token: tokenHunter } } } } =  await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);

  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id, 'sucursal 2', '1132569976001'), tokenMaker);

  const { body: bodyMaker } = await utils.callToQraphql(serverRequest, getOfficeQuery(addOffice.id), tokenMaker);
  const { body: bodyHunter } = await utils.callToQraphql(serverRequest, getOfficeQuery(addOffice.id), tokenHunter);

  t.falsy(bodyHunter.data);
  t.truthy(bodyMaker.data);

  const { errors } = bodyHunter;
  t.is(errors[0].message, 'Not have permissions for hunter role.');
});

test('Office: office > get an specific office from my offices', async t => {
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

  function getAddOfficeQuery(companyId, name, ruc) {
    return {
      query: `
        mutation {
          addOffice(input: {
            ruc: "${ruc}"
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

  function getOfficeQuery(officeId) {
    return {
      query: `
        {
          office(id: "${officeId}") {
            id
            ruc
            name
          }
        }
      `
    }
  }

  let serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenMaker } } } } =  await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);

  const { body: { data: { addOffice: addOffice2 } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id, 'sucursal 2', '1132569976001'), tokenMaker);
  const { body: { data: { addOffice: addOffice3 } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id, 'sucursal 3', '1132569976004'), tokenMaker);

  const { body: { data: { office: office1 } } } = await utils.callToQraphql(serverRequest, getOfficeQuery(addOffice2.id), tokenMaker);
  t.truthy(office1.id);
  t.is(office1.name, 'sucursal 2');
  t.is(office1.ruc, '1132569976001');

  const { body: { data: { office: office2 } } } = await utils.callToQraphql(serverRequest, getOfficeQuery(addOffice3.id), tokenMaker);
  t.truthy(office2.id);
  t.is(office2.name, 'sucursal 3');
  t.is(office2.ruc, '1132569976004');
});
