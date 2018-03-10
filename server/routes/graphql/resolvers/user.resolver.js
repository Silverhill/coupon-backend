import jwt from 'jsonwebtoken';
import config from '../../../config';
import { requiresAuth, filterUsersByRole, roleExist } from '../../../services/graphql.service';

/**
 * QUERY
 */
export const allUsers = requiresAuth( async (parent, args, { models }) => {
  const users = await models.User.find({}, '-salt -password');
  return users.map(user => {
    user._id = user._id.toString();

    return user;
  });
});

export const allMakers = requiresAuth( async (parent, args, { models }) => {
  const users = await models.Maker.find({}, '-salt -password');

  const makers = filterUsersByRole(users, 'maker');
  return makers.map(maker => {
    maker._id = maker._id.toString();
    return maker;
  });
}, ['maker']);

export const allHunters = requiresAuth( async (parent, args, { models }) => {
  const users = await models.Hunter.find({}, '-salt -password');

  const hunters = filterUsersByRole(users, 'hunter');
  return hunters.map(hunter => {
    hunter._id = hunter._id.toString();
    return hunter;
  });
}, ['maker', 'hunter']);

export const getUser = requiresAuth( async (parent, args, { models }) => {
  const { id } = args;
  const user = await models.User.findOne({ _id: id }, '-salt -password');
  user._id = user._id.toString();

  return user;
});

export const me = requiresAuth(async (parent, args, { models, request }) => {
  const { headers: { authentication } } = request;
  const userInfo = jwt.verify(authentication, config.secrets.session);

  const user = await models.User.findOne({ _id: userInfo._id }, '-salt -password');

  return user;
}, ['maker', 'hunter']);

/**
 * MUTATIONS
 */

export const register = async (parent, { user: _user }, { models }) => {
  const hasValidRole = roleExist(_user.role);
  _user.role = (_user.role || '').toLowerCase();

  if (!_user.role) _user.role = 'hunter';
  else if (!hasValidRole) throw new Error('Role is incorrect for the correct creation');
  else if (_user.role === 'admin') throw new Error('You can not create users with admin role');

  let user = await new models.User(_user);
  user.provider = 'local';
  user = await user.save();

  return user;
};

export const login = async (parent, { email, password }, { models }) => {
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
};

export const changePassword = requiresAuth(async (parent, args, { models, request }) => {
  const { oldPass, newPass } = args;
  const { headers: { authentication } } = request;
  if(!authentication) throw new Error('You need logged to changue password');

  oldPass.toString();
  newPass.toString();

  const { _id } = jwt.verify(authentication, config.secrets.session);
  let user = await models.User.findById(_id);


  if (user.authenticate(oldPass)) {
    user.password = newPass;
    user = await user.save();
  } else {
    throw new Error('Problem to changue the password');
  }

  return user;
});
