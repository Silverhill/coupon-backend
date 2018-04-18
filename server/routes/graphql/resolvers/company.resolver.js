import { extractUserIdFromToken } from '../../../services/model.service';
import _ from 'lodash';
import cloudinary from 'cloudinary';
import fs from 'fs';
import { storeFile } from './file.resolver';

export const addCompany = async (parent, args, { models, request }) => {
  const { input } = args;
  const { headers: { authentication } } = request;
  const makerId = await extractUserIdFromToken(authentication);

  const { company: makerCompany } = await models.Maker.findOne({ _id: makerId })

  if (!_.isEmpty(makerCompany)) {
    throw Error('Only one company can be created.');
  }

  const company = {
    ...input,
    createdAt: new Date(),
    updatedAt: new Date(),
    maker: makerId
  }

  if(company.upload){
    const { stream, filename } = await company.logo;
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

export const myCompany = async (parent, args, { models, request }) => {
  const { headers: { authentication } } = request;
  const makerId = await extractUserIdFromToken(authentication);

  try {
    const { company } = await models.Maker.findOne({ _id: makerId })
                                          .populate('company');
    return company;
  } catch (error) {
    return error;
  }
}

async function addCompanyToMaker(makerId, companyId, models) {
  await models.Maker.findByIdAndUpdate(makerId,
    {
      company: companyId,
      updatedAt: new Date()
    },
    { new: true }
  );
}

