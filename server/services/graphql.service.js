import jwt from 'jsonwebtoken';
import config from '../config';
import { extractUserIdFromToken } from './model.service';
import User from '../models/user.model';


export const requiresAuth = (resolver, permissionsByRole = [], params) => async (parent, args, context) => {
  if(!resolver) return;

  // Get headers from the request passed to the context grapqhl schema
  const { request: { headers } } = context;
  const authentication = headers.authentication;

  // Verify if header authentication with token exist
  if(!authentication) {
    throw new Error('Missing token authentication.');
  }

  // Verify if token is valid
  const tokenInfo = await jwt.verify(authentication, config.secrets.session);

  await hasRole(tokenInfo, permissionsByRole);

  const currentUser = await getCurrentUser(authentication);

  args.currentUser = currentUser;

  if (params) context.params = params;

  // Return graphql resolver
  return resolver(parent, args, context);
};

export const getCurrentUser = async (token) => {
  const userId = await extractUserIdFromToken(token);
  const user = await User.findOne({ _id: userId }, '-salt -password');
  if(user){
    return user;
  }else{
    throw new Error('Invalid token. Login, please.');
  }
}

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
