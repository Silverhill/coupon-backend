import test from 'ava';
import { connectDB, dropDB } from '../mocks/db';
import request from 'supertest';
import app from '../../server/server';
import utils from '../utils/test.utils'

const adminLoginQuery = utils.getAdminLoginQuery()

test.beforeEach('connect with mongodb', async () => {
  await connectDB();
  await utils.createDefaultUsers();
});

test.afterEach.always(async () => {
  await dropDB();
});

test('Should create a Plan', async t => {
  t.plan(7)

  let serverRequest = request(app)

  const loginResponse = await utils.callToQraphql(serverRequest, adminLoginQuery);

  const { data: { signIn: { token } } } = loginResponse.body

  const addPlanResponse = await utils.callToQraphql(serverRequest, getAddPlanQuery(), token);

  t.is(addPlanResponse.status, 200);

  const { body: { data: { addPlan } } } = addPlanResponse

  t.is(addPlan.deleted, false);
  t.is(addPlan.name, 'Plan test 1');
  t.is(addPlan.quantity, 10);
  t.is(addPlan.couponPrice, 10);
  t.is(addPlan.totalPrice, 100);
  t.is(addPlan.validity, 20);
});

test('Should update a Plan', async t => {
  t.plan(4)

  function getUpdatePlanQuery(id) {
    return {
      query: `
        mutation {
          updatePlan(input: {
            id: "${id}"
            name: "New Plan Name"
          }){
            _id
            name
            quantity
            couponPrice
            totalPrice
            validity
            deleted
          }
        }
      `
    }
  }

  let serverRequest = request(app);

  const loginResponse = await utils.callToQraphql(serverRequest, adminLoginQuery);

  const { data: { signIn: { token } } } = loginResponse.body;

  const addPlanResponse = await utils.callToQraphql(serverRequest, getAddPlanQuery(), token);

  const { body: { data: { addPlan } } } = addPlanResponse;
  const { _id: id } = addPlan;

  const updatePlanQuery = getUpdatePlanQuery(id);

  const updatePlanResponse = await utils.callToQraphql(serverRequest, updatePlanQuery, token);

  const { body: { data: { updatePlan } } } = updatePlanResponse;

  t.is(updatePlanResponse.status, 200);
  t.is(updatePlan._id, addPlan._id);
  t.is(updatePlan.name, 'New Plan Name');
  t.is(updatePlan.deleted, false);
});

test('Should delete/disable a Plan', async t => {
  t.plan(3)

  function getDeletePlanQuery(id) {
    return {
      query: `
        mutation {
          deletePlan(input: {
            id: "${id}"
          }){
            _id
            name
            quantity
            couponPrice
            totalPrice
            validity
            deleted
          }
        }
      `
    }
  }

  let serverRequest = request(app);

  const loginResponse = await utils.callToQraphql(serverRequest, adminLoginQuery);

  const { data: { signIn: { token } } } = loginResponse.body;

  const addPlanResponse = await utils.callToQraphql(serverRequest, getAddPlanQuery(), token);

  const { body: { data: { addPlan } } } = addPlanResponse;
  const { _id: id } = addPlan;

  const deletePlanQuery = getDeletePlanQuery(id);

  const deletePlanResponse = await utils.callToQraphql(serverRequest, deletePlanQuery, token)

  const { body: { data: { deletePlan } } } = deletePlanResponse;

  t.is(deletePlanResponse.status, 200);
  t.is(deletePlan._id, addPlan._id);
  t.is(deletePlan.deleted, true);
});

test('Should get all Plans', async t => {
  t.plan(5)

  const allPlansQuery = {
    query: `{
      allPlans {
        _id
        quantity
        couponPrice
        name
        totalPrice
        validity
        deleted
      }
    }
    `
  }

  let serverRequest = request(app);

  const loginResponse = await utils.callToQraphql(serverRequest, adminLoginQuery);

  const { data: { signIn: { token } } } = loginResponse.body;

  // Add three plans
  await utils.callToQraphql(serverRequest, getAddPlanQuery('Plan 1'), token)
  await utils.callToQraphql(serverRequest, getAddPlanQuery('Plan 2'), token)
  await utils.callToQraphql(serverRequest, getAddPlanQuery('Plan 3'), token)

  const allPlansResponse = await utils.callToQraphql(serverRequest, allPlansQuery, token);

  const { body: { data: { allPlans } } } = allPlansResponse;

  t.is(allPlansResponse.status, 200);
  t.is(allPlans.length, 3);
  t.is(allPlans[0].name, 'Plan 1');
  t.is(allPlans[1].name, 'Plan 2');
  t.is(allPlans[2].name, 'Plan 3');

});

test('Should get an specific Plan', async t => {
  t.plan(6)

  function getPlanQuery(id) {
    return {
      query: `{
        plan(id: "${id}"){
          _id
          name
        }
      }
      `
    }
  }

  let serverRequest = request(app);

  const loginResponse = await utils.callToQraphql(serverRequest, adminLoginQuery);

  const { data: { signIn: { token } } } = loginResponse.body;

  // Add four plans
  const res1 = await utils.callToQraphql(serverRequest, getAddPlanQuery('Plan 1'), token)
  await utils.callToQraphql(serverRequest, getAddPlanQuery('Plan 2'), token)
  const res2 = await utils.callToQraphql(serverRequest, getAddPlanQuery('Plan 3'), token)
  await utils.callToQraphql(serverRequest, getAddPlanQuery('Plan 4'), token)

  const { body: { data: { addPlan: plan1 } } } = res1;

  const { _id: id1 } = plan1;

  const { body: { data: { addPlan: plan2 } } } = res2;
  const { _id: id2 } = plan2;

  const resForPlan1 = await utils.callToQraphql(serverRequest, getPlanQuery(id1), token);

  const resForPlan2 = await utils.callToQraphql(serverRequest, getPlanQuery(id2), token);

  const { body: { data: { plan: _plan1 } } } = resForPlan1;
  const { body: { data: { plan: _plan2 } } } = resForPlan2;

  t.is(resForPlan1.status, 200);
  t.is(resForPlan2.status, 200);
  t.is(_plan1._id, id1);
  t.is(_plan2._id, id2);
  t.is(_plan1.name, 'Plan 1');
  t.is(_plan2.name, 'Plan 3');
});

function getAddPlanQuery(name = 'Plan test 1') {
  return {
    query: `
      mutation {
        addPlan(input: {
          name: "${name}"
          quantity: 10
          couponPrice: 10
          totalPrice: 100
          validity: 20
        }) {
          _id
          name
          quantity
          couponPrice
          totalPrice
          validity
          deleted
        }
      }
    `
  }
}
