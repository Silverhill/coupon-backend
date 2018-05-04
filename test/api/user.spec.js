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

test('User: updateUser > Maker: Should update the user info', async t => {
  t.plan(8)
  const updateMakerQuery = {
    query: `
      mutation {
        updateUser(input: {
          name: "New name"
          email: "newemail@test.com"
        }) {
          id
          name
          email
          provider
          role
        }
      }
    `
  }

  const meQuery = {
    query: `
      {
        me {
          id
          name
          email
          provider
          role
        }
      }
    `
  }

  let serverRequest = request(app);
  const resp = await utils.callToQraphql(serverRequest, makerLoginQuery);

  const { body: { data: { signIn: { token: tokenMaker } } } } = resp;

  const resp2 = await utils.callToQraphql(serverRequest, updateMakerQuery, tokenMaker);
  const { body: { data: { updateUser } } } = resp2
  t.truthy(updateUser)
  t.truthy(updateUser.id)
  t.is(updateUser.name, 'New name')
  t.is(updateUser.email, 'newemail@test.com')

  const { body: { data: { me } } } = await utils.callToQraphql(serverRequest, meQuery, tokenMaker);
  t.truthy(me)
  t.truthy(me.id)
  t.is(me.name, 'New name')
  t.is(me.email, 'newemail@test.com')
});

test('User: updateUser > Hunter: Should update the user info', async t => {

  t.plan(8)
  const updateHunterQuery = {
    query: `
      mutation {
        updateUser(input: {
          name: "New hunter name"
          email: "hunternew@test.com"
        }) {
          id
          name
          email
          provider
          role
        }
      }
    `
  }

  const meQuery = {
    query: `
      {
        me {
          id
          name
          email
          provider
          role
        }
      }
    `
  }

  let serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenHunter } } } } = await utils.callToQraphql(serverRequest, hunterLoginQuery);
  const { body: { data: { updateUser } } } = await utils.callToQraphql(serverRequest, updateHunterQuery, tokenHunter);
  t.truthy(updateUser)
  t.truthy(updateUser.id)
  t.is(updateUser.name, 'New hunter name')
  t.is(updateUser.email, 'hunternew@test.com')

  const { body: { data: { me } } } = await utils.callToQraphql(serverRequest, meQuery, tokenHunter);
  t.truthy(me)
  t.truthy(me.id)
  t.is(me.name, 'New hunter name')
  t.is(me.email, 'hunternew@test.com')

});

test('User: updateUser > Should return an error if email is invalid', async t => {
  t.plan(2)

  const invalidUpdateQuery = {
    query: `
      mutation {
        updateUser(input: {
          name: "New name"
          email: "email1@@test.com"
        }) {
          id
          name
          email
          provider
          role
        }
      }
    `
  }

  let serverRequest = request(app);
  const { body: { data: { signIn: { token: tokenMaker } } } } = await utils.callToQraphql(serverRequest, makerLoginQuery);
  const { body: { data, errors } } = await utils.callToQraphql(serverRequest, invalidUpdateQuery, tokenMaker);
  t.falsy(data)
  t.is(errors[0].message, 'Validation failed: email: Invalid email format.');
});
