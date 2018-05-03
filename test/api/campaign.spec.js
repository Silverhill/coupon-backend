import test from 'ava';
import { connectDB, dropDB } from '../mocks/db';
import request from 'supertest';
import app from '../../server/server';
import utils from '../utils/test.utils'
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


test('Campaign: Should get access only maker role', async t => {
  t.plan(3)

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
            startAt: 1521178272153
            endAt: 1522188672153
            couponsNumber: 20
            initialAgeRange: 18
            finalAgeRange: 50
            officeId: "${officeId}"
          }) {
            id
            title
          }
        }
      `
    }
  }

  let serverRequest = request(app);

  const hunterResponse = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const makerResponse = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { data: { signIn: { token: token2 } } } = hunterResponse.body
  const { data: { signIn: { token: token3 } } } = makerResponse.body

  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, token3);
  const { body: { data: { addOffice } }  } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), token3);

  const res2 = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), token2);
  const res3 = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), token3);

  const { body: bodyHunter } = res2;
  const { body: bodyMaker } = res3;

  t.falsy(bodyHunter.data);
  t.truthy(bodyMaker.data);

  const { errors: errors1 } = bodyHunter;

  t.is(errors1[0].message, 'Not have permissions for hunter role.');
});

test('Campaign: Should create a Campaign', async t => {
  t.plan(15)

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
            startAt: 1521178272153
            endAt: 1522188672153
            couponsNumber: 20
            initialAgeRange: 18
            finalAgeRange: 50
            officeId: "${officeId}"
          }) {
            id
            title
            country
            city
            description
            customMessage
            startAt
            endAt
            totalCoupons
            huntedCoupons
            redeemedCoupons
            initialAgeRange
            finalAgeRange
            createdAt
            deleted
          }
        }
      `
    }
  }

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);

  const addCampaignResponse = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);
  t.is(addCampaignResponse.status, 200);

  const { body: { data: { addCampaign } } } = addCampaignResponse;

  t.is(addCampaign.title, 'Campaign 1');
  t.is(addCampaign.country, 'Ecuador');
  t.is(addCampaign.city, 'Loja');
  t.is(addCampaign.description, 'Description 1');
  t.is(addCampaign.customMessage, 'a custom message');
  t.is(addCampaign.startAt, 1521178272153);
  t.is(addCampaign.endAt, 1522188672153);
  t.is(addCampaign.totalCoupons, 20);
  t.is(addCampaign.huntedCoupons, 0);
  t.is(addCampaign.redeemedCoupons, 0);
  t.is(addCampaign.initialAgeRange, 18);
  t.is(addCampaign.finalAgeRange, 50);
  t.truthy(addCampaign.createdAt);
  t.is(addCampaign.deleted, false);
});

test('Campaign: age range should be greater or equal to 1 and less than 100', async t => {
  t.plan(9)

  function getAddCampaignQuery(officeId, initialAgeRange, finalAgeRange) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "Campaign 1"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            customMessage: "a custom message"
            startAt: 1521178272153
            endAt: 1522188672153
            couponsNumber: 20
            initialAgeRange: ${initialAgeRange}
            finalAgeRange: ${finalAgeRange}
            officeId: "${officeId}"
          }) {
            id
            title
          }
        }
      `
    }
  }

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);

  const { body: { errors: errorsTest1, data: dataTest1 } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, -18, 50), tokenMaker);
  t.falsy(dataTest1);
  t.is(errorsTest1[0].message, 'Campaign validation failed: initialAgeRange: initialAgeRange should be in the range of 1 to 99.');
  const { body: { errors: errorsTest2, data: dataTest2 } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 18, 101), tokenMaker);
  t.falsy(dataTest2);
  t.is(errorsTest2[0].message, 'Campaign validation failed: finalAgeRange: finalAgeRange should be in the range of 2 to 100.');
  const { body: { errors: errorsTest3, data: dataTest3 } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 0, 50), tokenMaker);
  t.falsy(dataTest3);
  t.is(errorsTest3[0].message, 'Campaign validation failed: initialAgeRange: initialAgeRange should be in the range of 1 to 99.');
  const { body: { data: { addCampaign: addCampaignTest4 } } }= await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 1, 100), tokenMaker);
  t.truthy(addCampaignTest4)
  t.truthy(addCampaignTest4.id)
  t.is(addCampaignTest4.title, 'Campaign 1')
});

test('Campaign: initialAgeRange should be less than finalAgeRange', async t => {
  t.plan(5)

  function getAddCampaignQuery(officeId, initialAgeRange, finalAgeRange) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "Campaign 1"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            customMessage: "a custom message"
            startAt: 1521178272153
            endAt: 1522188672153
            couponsNumber: 20
            initialAgeRange: ${initialAgeRange}
            finalAgeRange: ${finalAgeRange}
            officeId: "${officeId}"
          }) {
            id
            title
          }
        }
      `
    }
  }

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);

  const { body: { errors: errorsTest1, data: dataTest1 } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 50, 25), tokenMaker);

  t.falsy(dataTest1);
  t.is(errorsTest1[0].message, 'Campaign validation failed: initialAgeRange: initialAgeRange should be less than finalAgeRange.');
  const { body: { data: { addCampaign: addCampaignTest2 } } }= await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 25, 50), tokenMaker);
  t.truthy(addCampaignTest2)
  t.truthy(addCampaignTest2.id)
  t.is(addCampaignTest2.title, 'Campaign 1')
});

test('Campaign: endAt should be greater than startAt', async t => {
  t.plan(2)
  function getAddCampaignQuery(officeId) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "Campaign 1"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            startAt: 1522188672153
            endAt: 1521178272153
            couponsNumber: 20
            initialAgeRange: 18
            finalAgeRange: 50
            officeId: "${officeId}"
          }) {
            id
            title
          }
        }
      `
    }
  }

  let serverRequest = request(app)
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);

  const addCampaignResponse = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);
  t.is(addCampaignResponse.status, 200);

  const { body: { errors } } = addCampaignResponse;
  t.is(errors[0].message, 'Campaign validation failed: endAt: endAt should be greater than startAt.');
});

test('Campaign: Should update a Campaign', async t => {
  t.plan(3);
  function getAddCampaignQuery(officeId) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "Campaign 1"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            startAt: 1521178272153
            endAt: 1522188672153
            couponsNumber: 20
            initialAgeRange: 18
            finalAgeRange: 50
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
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);

  const updateCampaignResponse = await utils.callToQraphql(serverRequest, getUpdateCampaignQuery(addCampaign.id), tokenMaker);
  t.is(updateCampaignResponse.status, 200);

  const { body: { data: { updateCampaign } } } = updateCampaignResponse;

  t.is(updateCampaign.title, 'Campaign updated');
  t.is(updateCampaign.deleted, false);
});

test('Campaign: Should delete a Campaign', async t => {
  t.plan(2);
  function getAddCampaignQuery(officeId) {
    return {
      query: `
        mutation {
          addCampaign(input: {
            title: "Campaign 1"
            country: "Ecuador"
            city: "Loja"
            description: "Description 1"
            startAt: 1521178272153
            endAt: 1522188672153
            couponsNumber: 20
            initialAgeRange: 18
            finalAgeRange: 50
            officeId: "${officeId}"
          }) {
            id
            title
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
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);
  const deleteCampaignResponse = await utils.callToQraphql(serverRequest, getDeleteCampaignQuery(addCampaign.id), tokenMaker);
  t.is(deleteCampaignResponse.status, 200);

  const { body: { data: { deleteCampaign } } } = deleteCampaignResponse;
  t.is(deleteCampaign.deleted, true);
})

test('Campaign: Should get a Campaign', async t => {
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
            initialAgeRange: 18
            finalAgeRange: 50
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

test('Campaign: Hunter: Should get all campaigns', async t => {
  t.plan(7);
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
            initialAgeRange: 18
            finalAgeRange: 50
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
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 'Campaign 2'), tokenMaker);
  await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);

  const allCampaignsResponse = await utils.callToQraphql(serverRequest, allCampaignsQuery, tokenHunter);
  t.is(allCampaignsResponse.status, 200);

  const { body: { data: { allCampaigns } } } = allCampaignsResponse;
  t.is(allCampaigns.campaigns.length, 2);
  t.is(allCampaigns.totalCount, 2);
  t.is(allCampaigns.campaigns[0].title, 'Campaign 1');
  t.is(allCampaigns.campaigns[0].couponsHuntedByMe, 0);
  t.is(allCampaigns.campaigns[1].title, 'Campaign 2');
  t.is(allCampaigns.campaigns[1].couponsHuntedByMe, 1);
});

test('Campaign: Hunter: Return empty array if there is not coupons', async t => {
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
            initialAgeRange: 18
            finalAgeRange: 50
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

  const { body: { data: { allCampaigns } } }= await utils.callToQraphql(serverRequest, allCampaignsQuery, tokenHunter);

  t.is(allCampaigns.campaigns.length, 3);
  t.is(allCampaigns.totalCount, 3);
  t.is(allCampaigns.campaigns[0].title, 'Campaign 1');
  t.is(allCampaigns.campaigns[0].couponsHuntedByMe, 0);
  t.is(allCampaigns.campaigns[1].title, 'Campaign 2');
  t.is(allCampaigns.campaigns[1].couponsHuntedByMe, 0);
  t.is(allCampaigns.campaigns[2].title, 'Campaign 3');
  t.is(allCampaigns.campaigns[2].couponsHuntedByMe, 0);
});

test('Campaign: Maker: Should get my campaigns', async t => {
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
            initialAgeRange: 18
            finalAgeRange: 50
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


test('Campaign: Should create a coupon after the hunter capture one', async t => {
  t.plan(3);

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
            initialAgeRange: 18
            finalAgeRange: 50
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
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);
  await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);
  const huntedCouponsByCampaignResponse = await utils.callToQraphql(serverRequest, getHuntedCouponsByCampaignQuery(addCampaign.id), tokenMaker);
  t.is(huntedCouponsByCampaignResponse.status, 200);

  const { body: { data: { huntedCouponsByCampaign } } } = huntedCouponsByCampaignResponse;
  t.is(huntedCouponsByCampaign.length, 1);
  t.truthy(huntedCouponsByCampaign[0].id);
})

test('Campaign: Should get an empty array if there are no hunted coupons', async t => {
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
            initialAgeRange: 18
            finalAgeRange: 50
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

test('Campaign: Should validate if there are hunted coupons and prevent delete the campaign', async t => {
  t.plan(3);

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
            couponsNumber: 20
            initialAgeRange: 18
            finalAgeRange: 50
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

  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { addCompany } } } = await utils.callToQraphql(serverRequest, addCompanyQuery, tokenMaker);
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), tokenMaker);
  const { body: { data: { addCampaign } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), tokenMaker);
  const captureCouponResponse = await utils.callToQraphql(serverRequest, getCaptureCouponQuery(addCampaign.id), tokenHunter);
  t.is(captureCouponResponse.status, 200);

  const deleteCampaignResponse = await utils.callToQraphql(serverRequest, getDeleteCampaignQuery(addCampaign.id), tokenMaker);
  t.is(deleteCampaignResponse.status, 200);

  const { body: { errors } } = deleteCampaignResponse;
  t.is(errors[0].message, 'This campaign can not be deleted because there are coupons hunted.');
})

test('Campaign > huntersByCampaign: should get the hunter list of a specific campaign', async t => {
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
            initialAgeRange: 18
            finalAgeRange: 50
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

test('Campaign > huntersByCampaign: should get an empty array if there are no hunters in a specific campaign', async t => {
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
            initialAgeRange: 18
            finalAgeRange: 50
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

  const { body: { data, errors} } = await utils.callToQraphql(serverRequest, getHuntersByCampaign(campaign1.id), tokenMaker);

  t.deepEqual(data.huntersByCampaign, [])
  t.falsy(errors)
});

test('Campaign: should have status: unavailable', async t => {
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
            initialAgeRange: 18
            finalAgeRange: 50
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

test('Campaign: should have status: available', async t => {
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
            initialAgeRange: 18
            finalAgeRange: 50
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

test('Campaign: should have status: expired', async t => {
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
            initialAgeRange: 18
            finalAgeRange: 50
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

test('Campaign: should have status: soldout', async t => {
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
            initialAgeRange: 18
            finalAgeRange: 50
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
