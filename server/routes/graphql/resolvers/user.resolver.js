import jwt from 'jsonwebtoken';
import fs from 'fs';
import cloudinary from 'cloudinary';
import config from '../../../config';
import { roleExist } from '../../../services/graphql.service';
import { storeFile } from './file.resolver';

/**
 * QUERY
 */
export const allUsers = async (parent,
                              {
                                limit = 10,
                                skip = 0,
                                sortField = 'createdAt',
                                sortDirection = 1
                              }, { models }) => {
  const sortObject = {};
  sortObject[sortField] = sortDirection;
  const total = await models.User.count({});
  const users = await models.User.find({}, '-salt -password')
                                 .limit(limit)
                                 .skip(skip)
                                 .sort(sortObject);
  const returnObject = {
    users: users,
    totalCount: total
  }
  return returnObject;
};

export const allMakers = async (parent, {
                                          limit = 10,
                                          skip = 0,
                                          sortField = 'createdAt',
                                          sortDirection = 1
                                        }, { models }) => {
  const sortObject = {};
  sortObject[sortField] = sortDirection;
  const total = await models.User.count({'_type': 'Maker'});
  const users = await models.User.find({'_type': 'Maker'}, '-salt -password')
                                 .limit(limit)
                                 .skip(skip)
                                 .sort(sortObject);
  const returnObject = {
    makers: users,
    totalCount: total
  }
  return returnObject;

};

export const allHunters = async (parent, {
                                          limit = 10,
                                          skip = 0,
                                          sortField = 'createdAt',
                                          sortDirection = 1
                                        }, { models }) => {

  const sortObject = {};
  sortObject[sortField] = sortDirection;
  const total = await models.User.count({'_type': 'Hunter'});
  const users = await models.User.find({'_type': 'Hunter'}, '-salt -password')
                                 .limit(limit)
                                 .skip(skip)
                                 .sort(sortObject);
  const returnObject = {
    hunters: users,
    totalCount: total
  }
  return returnObject;
};

export const getUser = async (parent, args, { models }) => {
  const { id } = args;
  const user = await models.User.findOne({ _id: id }, '-salt -password');
  return user;
};

export const me = async (parent, args, { models, request }) => {
  const { headers: { authentication: token } } = request;
  const { id: userId, role } = await extractUserInfoFromToken(token);

  let user;
  if(role === 'hunter') {
    user = await models.Hunter
      .findOne({ _id: userId }, '-salt -password')
      .populate('coupons');
  }
  else if(role === 'maker') {
    user = await models.Maker
      .findOne({ _id: userId }, '-salt -password')
      .populate('campaigns');
  }
  else if(role === 'admin') {
    user = await models.User.findOne({ _id: userId }, '-salt -password');
  }

  return user;
};


export const myCoupons = async (parent, {
  limit = 10,
  skip = 0,
  sortField = 'createdAt',
  sortDirection = 1
}, { models, request }) => {
  const { headers: { authentication: token } } = request;

  const sortObject = {};
  sortObject[sortField] = sortDirection;

  const { id } = await extractUserInfoFromToken(token);
  const { coupons } = await models.Hunter.findOne({ _id: id });
  const myCouponsInfo = await models.Coupon.find({ _id: { "$in": coupons || [] } })
    .limit(limit)
    .skip(skip)
    .sort(sortObject)
    .populate({
      path: 'campaign',
      select: '-coupons',
      populate: {
        path: 'maker',
        select: '-campaigns'
      }
    });

  return myCouponsInfo;
}

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
  const { company: companyName } = _user;

  if (_user.company) {
    delete _user.company;
  }

  try {

    let res = await registerUser(_user, models);

    if (res.role == 'maker') {
      const newCompany = await createCompany(companyName, res._id, models);
      res = await models.Maker.findByIdAndUpdate(res._id,
        {
          company: newCompany._id,
          updatedAt: new Date()
        },
        { new: true }
      );

    }

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
    user.updatedAt = new Date()
    user = await user.save();
  } else {
    throw new Error('Problem to changue the password');
  }

  return user;
};

export const addImageToUser = async (parent, { upload } , { models, request }) => {
  const { stream, filename } = await upload;
  const { headers: { authentication: token } } = request;
  const { id } = await extractUserInfoFromToken(token);

  let user = await models.User.findOne({ _id: id });

  const { path } = await storeFile({ stream, filename });
  await cloudinary.v2.uploader.upload(path, async (error, result) => {
    if (result) {
      user.image = result.url;
      user.updatedAt = new Date();
      fs.unlinkSync(path);
      user = await user.save();
    } else if (error) {
      return error;
    }
  });

  return user;
};

const loginUser = async (email, password, models) => {
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

const registerUser = async (_user, models) => {
  const hasValidRole = roleExist(_user.role);
  _user.role = (_user.role || 'hunter').toLowerCase();

  if (!hasValidRole) throw new Error('Role is incorrect for the correct creation');
  else if (_user.role === 'admin') throw new Error('You can not create users with admin role');
  let user;
  if (_user.role === 'hunter') user = await new models.Hunter(_user);
  if (_user.role === 'maker') user = await new models.Maker(_user);
  user.provider = 'local';
  user.createdAt = new Date();
  user.updatedAt = new Date();
  user = await user.save();

  return user;
}

const createCompany = async (companyName, makerId, models) => {
  if (companyName) {
    const company = {
      businessName: companyName,
      createdAt: new Date(),
      updatedAt: new Date(),
      maker: makerId
    }

    const newCompany = await new models.Company(company);

    try {
      await newCompany.save();
      await addCompanyToMaker(makerId, newCompany._id, models)
      return newCompany;
    } catch (error) {
      throw new Error(error.message || error);
    }
  }
}

const addCompanyToMaker = async (makerId, companyId, models) => {
  await models.Maker.findByIdAndUpdate(makerId,
    {
      company: companyId,
      updatedAt: new Date()
    },
    { new: true }
  );
}
// User utils
const extractUserInfoFromToken = async (token) => {
  try {
    const { _id, role } = await jwt.verify(token, config.secrets.session);
    return {id: _id, role};
  } catch (error) {
    return null;
  }
}
