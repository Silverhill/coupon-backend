import test from 'ava';
import { connectDB, dropDB } from '../mocks/db';
import request from 'supertest';
import app from '../../server/server';
import User from '../../server/models/user.model';


test.beforeEach('connect with mongodb', async (t) => {
  await connectDB();
});

test.afterEach.always(async (t) => {
  await dropDB();
});

test.serial('Should get users', async t => {
  t.plan(1)

  const res = await request(app)
    .get('/users')
    .set('Accept', 'application/json');

  t.is(res.status, 500);
});


