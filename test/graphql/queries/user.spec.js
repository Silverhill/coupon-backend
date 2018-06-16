import test from 'ava';
import { connectDB, dropDB } from '../../mocks/db';
import request from 'supertest';
import app from '../../../server/server';
import utils from '../../utils/test.utils'

const hunterLoginQuery = utils.getHunterLoginQuery();

const meQuery = {
  query: `
    {
      me {
        ...on Hunter {
          id
          name
          email
          score
          role
        }
      }
    }
  `
}

test.beforeEach('connect with mongodb', async () => {
  await connectDB();
  await utils.createDefaultUsers();
  await utils.createDefaultSetting();
});

test.afterEach.always(async () => {
  await dropDB();
});

test('User: me > Hunter: Should return the Hunter data with the score param', async t => {
  t.plan(5)

  let serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { me } } } = await utils.callToQraphql(serverRequest, meQuery, tokenHunter);


  t.truthy(me.id);
  t.is(me.name, 'Hunter');
  t.is(me.email, 'hunter@example.com');
  t.is(me.score, 0);
  t.is(me.role, 'hunter');

});
