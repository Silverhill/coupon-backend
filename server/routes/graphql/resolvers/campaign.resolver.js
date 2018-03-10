import { requiresAuth } from '../../../services/graphql.service';
import jwt from 'jsonwebtoken';
import config from '../../../config';

/**
 * Plan Resolvers
 * @param {object} parent Data from the parent
 * @param {object} args get all arguments passed in the query
 * @param {object} context get request and models from the graphql schema
 */
export const allCampaigns = requiresAuth(async (parent, args, context) => {
  const { models } = context;
  const campaigns = await models.Campaign.find({});

  return campaigns;
});

export const myCampaigns = requiresAuth(async (parent, args, { models, request }) => {
  const { headers: { authentication } } = request;
  if(!authentication) throw new Error('You need logged to get campaigns');

  const { _id } = await jwt.verify(authentication, config.secrets.session);
  const { campaigns } = await models.Maker.findOne({ _id });
  return campaigns;
}, ['maker'])
