
import test from 'ava';
import { connectDB, dropDB } from '../../mocks/db';
import request from 'supertest';
import app from '../../../server/server';
import utils from '../../utils/test.utils'

const hunterLoginQuery = utils.getHunterLoginQuery();
const makerLoginQuery = utils.getMakerLoginQuery();
const adminLoginQuery = utils.getAdminLoginQuery();

test.beforeEach('connect with mongodb', async () => {
  await connectDB();
  await utils.createDefaultUsers();
  await utils.createDefaultSetting();
});

test.afterEach.always(async () => {
  await dropDB();
});

test('User: appSetting > Should return the app setting. Maker and admin only', async t => {
  t.plan(4)

  const appSettingQuery = {
      query: `
        {
          appSetting {
            scoreRedeemCoupon
          }
        }
      `
  }

  let serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenAdmin } } } } = await utils.callToQraphql(serverRequest, adminLoginQuery);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { body: bodyAdmin } = await utils.callToQraphql(serverRequest, appSettingQuery, tokenAdmin);
  const { body: bodyHunter } = await utils.callToQraphql(serverRequest, appSettingQuery, tokenHunter);
  const { body: bodyMaker } = await utils.callToQraphql(serverRequest, appSettingQuery, tokenMaker);

  t.truthy(bodyAdmin.data);
  t.falsy(bodyHunter.data);
  t.truthy(bodyMaker.data);

  const { errors } = bodyHunter;

  t.is(errors[0].message, 'Not have permissions for hunter role.');
});
