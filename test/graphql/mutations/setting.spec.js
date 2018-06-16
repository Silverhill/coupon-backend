import test from 'ava';
import { connectDB, dropDB } from '../../mocks/db';
import request from 'supertest';
import app from '../../../server/server';
import utils from '../../utils/test.utils'

const adminLoginQuery = utils.getAdminLoginQuery();

test.beforeEach('connect with mongodb', async () => {
  await connectDB();
  await utils.createDefaultUsers();
  await utils.createDefaultSetting();
});

test.afterEach.always(async () => {
  await dropDB();
});

test('Setting: updateAppSetting > Should update the app settings', async t => {
  t.plan(2)

  const updateAppSettingQuery = {
    query: `
      mutation {
        updateAppSetting(input: {
          scoreRedeemCoupon: 3
        }) {
          scoreRedeemCoupon
        }
      }
    `
  }

  let serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenAdmin } } } }  = await utils.callToQraphql(serverRequest, adminLoginQuery);
  const { body: { data: { updateAppSetting } } } = await utils.callToQraphql(serverRequest, updateAppSettingQuery, tokenAdmin);

  t.truthy(updateAppSetting)
  t.is(updateAppSetting.scoreRedeemCoupon, 3);
});
