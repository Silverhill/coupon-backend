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

test('Campaign: addCampaign > Should get access only maker role', async t => {
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
  const { body: { data: { addOffice } } } = await utils.callToQraphql(serverRequest, getAddOfficeQuery(addCompany.id), token3);

  const res2 = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), token2);
  const res3 = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id), token3);

  const { body: bodyHunter } = res2;
  const { body: bodyMaker } = res3;

  t.falsy(bodyHunter.data);
  t.truthy(bodyMaker.data);

  const { errors: errors1 } = bodyHunter;

  t.is(errors1[0].message, 'Not have permissions for hunter role.');
});

test('Campaign: addCampaign > Should create a Campaign', async t => {
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

test('Campaign: addCampaign > age range should be greater or equal to 1 and less than 100', async t => {
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
  const { body: { data: { addCampaign: addCampaignTest4 } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 1, 100), tokenMaker);
  t.truthy(addCampaignTest4)
  t.truthy(addCampaignTest4.id)
  t.is(addCampaignTest4.title, 'Campaign 1')
});

test('Campaign: addCampaign > initialAgeRange should be less than finalAgeRange', async t => {
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
  const { body: { data: { addCampaign: addCampaignTest2 } } } = await utils.callToQraphql(serverRequest, getAddCampaignQuery(addOffice.id, 25, 50), tokenMaker);
  t.truthy(addCampaignTest2)
  t.truthy(addCampaignTest2.id)
  t.is(addCampaignTest2.title, 'Campaign 1')
});

test('Campaign: addCampaign > endAt should be greater than startAt', async t => {
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

test('Campaign: updateCampaign > Should update a Campaign', async t => {
  t.plan(4);
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
            background: "rgb(10, 5, 7)"
          }) {
            id
            title
            background
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
  t.is(updateCampaign.background, 'rgb(10, 5, 7)')
  t.is(updateCampaign.deleted, false);
});

test('Campaign: deleteCampaign > Should delete a Campaign', async t => {
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

test('Campaign: captureCoupon > Should create a coupon after the hunter capture one', async t => {
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

test('Campaign: deleteCampaign > Should validate if there are hunted coupons and prevent delete the campaign', async t => {
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

test('Campaign: addCampaign > Should add background when the Campaign is created', async t => {
  t.plan(12)

  function getAddCampaignWithBackgroundQuery(officeId, background) {
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
            background: "${background}"
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
            background
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

  const { body: { data: { addCampaign: campaignLinearGradient } } } = await utils.callToQraphql(serverRequest, getAddCampaignWithBackgroundQuery(addOffice.id, "linear-gradient(rgb(249, 5, 11), rgb(10, 5, 7) 85%)"), tokenMaker);
  const { body: { data: { addCampaign: campaignImage } } } = await utils.callToQraphql(serverRequest, getAddCampaignWithBackgroundQuery(addOffice.id, "https://static8.depositphotos.com/1332722/1017/v/950/depositphotos_10178209-stock-illustration-seaml"), tokenMaker);
  const { body: { data: { addCampaign: campaignRadialGradient } } } = await utils.callToQraphql(serverRequest, getAddCampaignWithBackgroundQuery(addOffice.id, "radial-gradient(at right bottom, rgb(254, 219, 55) 0%, rgb(253, 185, 49) 8%, rgb(159, 121, 40) 30%, rgb(138, 110, 47) 40%, transparent 80%)"), tokenMaker);
  const { body: { data: { addCampaign: campaignHex } } } = await utils.callToQraphql(serverRequest, getAddCampaignWithBackgroundQuery(addOffice.id, "#f7f7f7"), tokenMaker);
  const { body: { data: { addCampaign: campaignRgb } } } = await utils.callToQraphql(serverRequest, getAddCampaignWithBackgroundQuery(addOffice.id, "rgb(10, 5, 7)"), tokenMaker);
  const { body: { data, errors } } = await utils.callToQraphql(serverRequest, getAddCampaignWithBackgroundQuery(addOffice.id, "xdxdxdxdxd"), tokenMaker);

  t.truthy(campaignLinearGradient);
  t.truthy(campaignLinearGradient.background);
  t.truthy(campaignImage);
  t.truthy(campaignImage.background);
  t.truthy(campaignRadialGradient);
  t.truthy(campaignRadialGradient.background);
  t.truthy(campaignHex);
  t.truthy(campaignHex.background);
  t.truthy(campaignRgb);
  t.truthy(campaignRgb.background);
  t.falsy(data)
  t.is(errors[0].message, 'Campaign validation failed: background: Invalid Background format.');
})
