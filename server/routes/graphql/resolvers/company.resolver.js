import _ from 'lodash';
import cloudinary from 'cloudinary';
import fs from 'fs';
import { storeFile } from './file.resolver';

export const addCompany = async (parent, args, { models }) => {
  const { input } = args;
  const {_id: makerId} = args.currentUser;

  const { company: makerCompany } = await models.Maker.findOne({ _id: makerId }) || {}

  if (!_.isEmpty(makerCompany)) {
    throw Error('Only one company can be created.');
  }

  const company = {
    ...input,
    maker: makerId
  }

  if (company.upload) {
    const { stream, filename } = await company.upload;
    const { path } = await storeFile({ stream, filename });
    await cloudinary.v2.uploader.upload(path, (error, result) => {
      if (result) {
        company.logo = result.url;
        fs.unlinkSync(path);
      } else if (error) {
        return error;
      }
    });
  }

  const newCompany = await new models.Company(company);

  try {
    await newCompany.save();
    await addCompanyToMaker(makerId, newCompany._id, models)
    return newCompany;
  } catch (error) {
    throw new Error(error.message || error);
  }

};

export const myCompany = async (parent, args, { models }) => {
  const {_id: makerId} = args.currentUser;

  try {
    const { company } = await models.Maker.findOne({ _id: makerId })
      .populate('company');
    return company;
  } catch (error) {
    return error;
  }
}

export const addImageToCompany = async (parent, { upload, ...args }, { models }) => {
  const { stream, filename } = await upload;
  const {_id: makerId} = args.currentUser;

  let { company } = await models.Maker.findOne({ _id: makerId })
    .populate('company');

  const { path } = await storeFile({ stream, filename });
  await cloudinary.v2.uploader.upload(path, async (error, result) => {
    if (result) {
      company.logo = result.url;
      fs.unlinkSync(path);
      company = await company.save();
    } else if (error) {
      return error;
    }
  });
  return company;
};

export const myHunters = async (parent, args, { models }) => {
  const {_id: makerId} = args.currentUser;

  try {

    const mycampaigns = await models.Campaign
      .find({
        maker: makerId
      })
      .populate({
        path: 'coupons',
        match: {
          hunter: { '$exists': true }
        },
        populate: {
          path: 'hunter',
          select: '-campaigns -salt -password -coupons'
        }
      });

    const allCoupons = [];
    for (let i = 0; i < mycampaigns.length; i++) {
      Array.prototype.push.apply(allCoupons, mycampaigns[i].coupons);
    }

    let hunters = [];
    for (let i = 0; i < allCoupons.length; i++) {
      const index = hunters.indexOf(allCoupons[i].hunter);
      if (index > -1) {
        if (allCoupons[i].status === 'redeemed') {
          hunters[index].redeemedCoupons += 1;
        } else {
          hunters[index].huntedCoupons += 1;
        }
      } else {
        if (allCoupons[i].status === 'redeemed') {
          allCoupons[i].hunter.redeemedCoupons = 1;
          allCoupons[i].hunter.huntedCoupons = 0;
        } else {
          allCoupons[i].hunter.huntedCoupons = 1;
          allCoupons[i].hunter.redeemedCoupons = 0;
        }
        hunters.push(allCoupons[i].hunter);
      }
    }
    return hunters;

  } catch (error) {
    return error;
  }
}

export const updateCompany = async (parent, args, context) => {
  const { models } = context;
  const { input } = args;

  try {
    const company = {
      ...input
    }

    if (company.upload) {
      const { stream, filename } = await company.upload;
      const { path } = await storeFile({ stream, filename });
      await cloudinary.v2.uploader.upload(path, (error, result) => {
        if (result) {
          company.logo = result.url;
          fs.unlinkSync(path);
        } else if (error) {
          return error;
        }
      });
    }

    const updatedCompany = await models.Company.findByIdAndUpdate(input.id,
      company,
      { new: true }
    )
    return updatedCompany;
  } catch (error) {
    throw new Error(error.message || error);
  }
}

async function addCompanyToMaker(makerId, companyId, models) {
  await models.Maker.findByIdAndUpdate(makerId,
    {
      company: companyId
    },
    { new: true }
  );
}

