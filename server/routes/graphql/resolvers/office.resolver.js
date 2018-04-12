import { extractUserIdFromToken } from '../../../services/model.service'

export const addOffice = async (parent, args, { models, request }) => {
  const { input } = args;
  const { companyId } = input;
  const { headers: { authentication } } = request;
  const makerId = await extractUserIdFromToken(authentication);

  let company = null;

  try {
    company = await models.Maker.findOne({ _id: makerId }).populate({
      path: 'company',
      match: {
        _id: companyId
      }
    });

  } catch (error) {
    throw Error('Invalid Company ID.');
  }

  const office = {
    ...input,
    createdAt: new Date(),
    updatedAt: new Date(),
    company: company._id
  }

  try {
    const newOffice = await new models.Office(office);
    await newOffice.save();
    return newOffice;
  } catch (error) {
    throw new Error(error.message || error);
  }

};
