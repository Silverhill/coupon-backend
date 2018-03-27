import jwt from 'jsonwebtoken';
import config from '../../../config';
import { roleExist } from '../../../services/graphql.service';

/**
 * QUERY
 */
export const allUsers = async (parent, args, { models }) => {
  const users = await models.User.find({}, '-salt -password');
  return users;
};

export const allMakers = async (parent, args, { models }) => {
  const users = await models.User.find({'_type': 'Maker'}, '-salt -password');
  return users;
};

export const allHunters = async (parent, args, { models }) => {
  const users = await models.User.find({'_type': 'Hunter'}, '-salt -password');
  return users;
};

export const getUser = async (parent, args, { models }) => {
  const { id } = args;
  const user = await models.User.findOne({ _id: id }, '-salt -password');
  return user;
};

export const me = async (parent, args, { models, request }) => {
  const { headers: { authentication } } = request;
  const userInfo = jwt.verify(authentication, config.secrets.session);

  const user = await models.User.findOne({ _id: userInfo._id }, '-salt -password');

  return user;
};

/**
 * MUTATIONS
 */

export const register = async (parent, { user: _user }, { models }) => {
  try {
    const res = await registerUser(_user, models);
    return res;
  } catch (error) {
    return error;
  }
};

export const signUp = async (parent, args, { models }) => {
  const { input: _user } = args;
  try {
    const res = await registerUser(_user, models);
    return res;
  } catch (error) {
    return error;
  }
};

export const login = async (parent, { email, password }, { models }) => {
  try {
    const token = await loginUser(email, password, models);
    return token;
  } catch (error) {
    return error;
  }
};

export const signIn = async (parent, args, { models }) => {
  const { email, password } = args;
  try {
    const token = await loginUser(email, password, models);
    return {
      token
    };
  } catch (error) {
    return error;
  }
};

export const updatePassword = async (parent, args, { models, request }) => {
  const { input } = args;
  const { headers: { authentication } } = request;
  if(!authentication) throw new Error('You need logged to changue password');

  const oldPass = input.oldPass.toString().trim();
  const newPass = input.newPass.toString().trim();

  const { _id } = jwt.verify(authentication, config.secrets.session);
  let user = await models.User.findById(_id);

  if (user.authenticate(oldPass)) {
    user.password = newPass;
    user = await user.save();
  } else {
    throw new Error('Problem to changue the password');
  }

  return user;
};

async function loginUser(email, password, models) {
  const user = await models.User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('Not user with that email.');
  }

  const passwordIsValid = user.authenticate(password);
  if (!passwordIsValid) {
    throw new Error('Password is not correct.')
  }

  let expiresIn = '1y';
  if (user.role === 'admin') {
    expiresIn = 60 * 60 * 5;
  }

  const token = jwt.sign({ _id: user._id, role: user.role }, config.secrets.session, {
    expiresIn
  });

  return token;
}

async function registerUser(_user, models) {
  const hasValidRole = roleExist(_user.role);
  _user.role = (_user.role || 'hunter').toLowerCase();

  if (!hasValidRole) throw new Error('Role is incorrect for the correct creation');
  else if (_user.role === 'admin') throw new Error('You can not create users with admin role');
  let user;
  if (_user.role === 'hunter') user = await new models.Hunter(_user);
  if (_user.role === 'maker') user = await new models.Maker(_user);
  user.provider = 'local';
  user = await user.save();

  return user;
}
