import jwt from 'jsonwebtoken';
import _ from 'lodash';
import config from '../config';

export const requiresAuth = (resolver, permissionsByRole = []) => async (parent, args, context) => {
  if(!resolver) return;
  // Set config defaults
  const defaults = {
    roles: ['admin'],
  };

  // Get headers from the request passed to the context grapqhl schema
  const { request: { headers } } = context;
  const authentication = headers.authentication;

  // Verify if header authentication with token exist
  if(!authentication) {
    throw new Error('Missing token authentication.');
  }

  // Verify if token is valid
  const tokenInfo = await jwt.verify(authentication, config.secrets.session);

  // Set permisions by role
  permissionsByRole = _.uniq(permissionsByRole.concat(defaults.roles));
  await hasRole(tokenInfo, permissionsByRole);

  // Return graphql resolver
  return resolver(parent, args, context);
};

const hasRole = async ({ role }, permissionsByRole = []) => {
  if (!role) {
    throw new Error('Required role to be set.');
  }

  if( !permissionsByRole.includes(role) ) {
    throw new Error(`Not have permissions for ${role} role.`);
  }
};

export const filterUsersByRole = (users, role) => {
  if(!role || !users.length) return [];
  return users.filter(user => user.role === role);
}

export const roleExist = role => {
  return config.userRoles.includes(role);
}
