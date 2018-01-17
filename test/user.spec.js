import test from 'ava';
import { connectDB, dropDB } from './mocks/db';
import request from 'supertest';
import app from '../server/server';

test.beforeEach('connect with mongodb', t => {
  connectDB(t, (err) => {
    console.log(err)
  });
});

test.afterEach.always(t => {
  dropDB(t);
});

test.serial('Should return error because no token', async t => {
  t.plan(1)
  const res = await request(app)
    .get('/users')
    .set('Accept', 'application/json');

  t.is(res.status, 500);
});
