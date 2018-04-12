import { extractUserIdFromToken } from '../../../services/model.service'
import _ from 'lodash'

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

  const newCompany = await new models.Company(company);

  try {
    await newCompany.save();
    await addCompanyToMaker(makerId, newCompany._id, models)
    return newCompany;
  } catch (error) {
    throw new Error(error.message || error);
  }

};

async function addCompanyToMaker(makerId, companyId, models) {
  await models.Maker.findByIdAndUpdate(makerId,
    {
      company: companyId,
      updatedAt: new Date()
    },
    { new: true }
  );
}

