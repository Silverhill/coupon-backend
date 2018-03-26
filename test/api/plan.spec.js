import test from 'ava';
import { connectDB, dropDB } from '../mocks/db';
import request from 'supertest';
import app from '../../server/server';
import User from '../../server/models/user.model';


test.beforeEach('connect with mongodb', async (t) => {
  await connectDB();
  await User.create({
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@example.com',
    password: 'admin'
  })
});

test.afterEach.always(async (t) => {
  await dropDB();
});

test('Should create a Plan', async t => {
  t.plan(2)

  let requestPlan = request(app)

  const req = await requestPlan
    .post('/auth/local')
    .send({
      password: 'admin',
      email: 'admin@example.com'
    })
    .set('Accept', 'application/json');

  const res = await requestPlan
    .post('/plans')
    .send({
      name: 'Plan 1'
    })
    .set('authorization', `Bearer ${req.body.token}`)
    .set('Accept', 'application/json');

  t.is(res.status, 201);
  t.is(res.body.deleted, false);
});


test('Should update a Plan', async t => {
  t.plan(4)

  let requestPlan = request(app)

  const resUser = await requestPlan
    .post('/auth/local')
    .send({
      password: 'admin',
      email: 'admin@example.com'
    })
    .set('Accept', 'application/json');

  const resCreate = await requestPlan
    .post('/plans')
    .send({
      name: 'Plan 1'
    })
    .set('authorization', `Bearer ${resUser.body.token}`)
    .set('Accept', 'application/json');

  let plan = resCreate.body;

  const resUpdate = await requestPlan
    .put(`/plans/${plan._id}`)
    .send({
      name: 'Plan Updated'
    })
    .set('authorization', `Bearer ${resUser.body.token}`)
    .set('Accept', 'application/json');

  const planUpdated = resUpdate.body;

  t.is(resUpdate.status, 201);
  t.is(planUpdated._id, plan._id);
  t.is(planUpdated.name, 'Plan Updated');
  t.is(planUpdated.deleted, false);
});

test('Should delete/disable a Plan', async t => {
  t.plan(3)

  let requestPlan = request(app)

  const resUser = await requestPlan
    .post('/auth/local')
    .send({
      password: 'admin',
      email: 'admin@example.com'
    })
    .set('Accept', 'application/json');

  const resCreate = await requestPlan
    .post('/plans')
    .send({
      name: 'Plan 1'
    })
    .set('authorization', `Bearer ${resUser.body.token}`)
    .set('Accept', 'application/json');

  let plan = resCreate.body;

  const resDeleted = await requestPlan
    .delete(`/plans/${plan._id}`)
    .set('authorization', `Bearer ${resUser.body.token}`)
    .set('Accept', 'application/json');

  const planDeleted = resDeleted.body;

  t.is(resDeleted.status, 200);
  t.is(planDeleted._id, plan._id);
  t.is(planDeleted.deleted, true);

});


test('Should get all Plans', async t => {
  t.plan(5)

  let requestPlan = request(app)

  const resUser = await requestPlan
    .post('/auth/local')
    .send({
      password: 'admin',
      email: 'admin@example.com'
    })
    .set('Accept', 'application/json');

  await requestPlan
    .post('/plans')
    .send({
      name: 'Plan 1'
    })
    .set('authorization', `Bearer ${resUser.body.token}`)
    .set('Accept', 'application/json');

  await requestPlan
    .post('/plans')
    .send({
      name: 'Plan 2'
    })
    .set('authorization', `Bearer ${resUser.body.token}`)
    .set('Accept', 'application/json');

  await requestPlan
    .post('/plans')
    .send({
      name: 'Plan 3'
    })
    .set('authorization', `Bearer ${resUser.body.token}`)
    .set('Accept', 'application/json');


  const res = await requestPlan
    .get('/plans')
    .set('authorization', `Bearer ${resUser.body.token}`)
    .set('Accept', 'application/json');

  const plans = res.body;

  t.is(res.status, 200);
  t.is(plans.length, 3);
  t.is(plans[0].name, 'Plan 1');
  t.is(plans[1].name, 'Plan 2');
  t.is(plans[2].name, 'Plan 3');

});

test('Should get an specific Plan', async t => {
  t.plan(6)

  let requestPlan = request(app)

  const resUser = await requestPlan
    .post('/auth/local')
    .send({
      password: 'admin',
      email: 'admin@example.com'
    })
    .set('Accept', 'application/json');

  const res1 = await requestPlan
    .post('/plans')
    .send({
      name: 'Plan 1'
    })
    .set('authorization', `Bearer ${resUser.body.token}`)
    .set('Accept', 'application/json');

  const res2 = await requestPlan
    .post('/plans')
    .send({
      name: 'Plan 2'
    })
    .set('authorization', `Bearer ${resUser.body.token}`)
    .set('Accept', 'application/json');

  const resForPlan1 = await requestPlan
    .get(`/plans/${res1.body._id}`)
    .set('authorization', `Bearer ${resUser.body.token}`)
    .set('Accept', 'application/json');

  const resForPlan2 = await requestPlan
    .get(`/plans/${res2.body._id}`)
    .set('authorization', `Bearer ${resUser.body.token}`)
    .set('Accept', 'application/json');

  t.is(resForPlan1.status, 200);
  t.is(resForPlan2.status, 200);
  t.is(resForPlan1.body._id, res1.body._id);
  t.is(resForPlan2.body._id, res2.body._id);
  t.is(resForPlan1.body.name, 'Plan 1');
  t.is(resForPlan2.body.name, 'Plan 2');

});
