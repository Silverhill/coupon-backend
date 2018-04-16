import { extractUserIdFromToken } from '../../../services/model.service'

//TODO: Valida RUC
export const addOffice = async (parent, args, { models, request }) => {
  const { input } = args;
  const { companyId } = input;
  const { headers: { authentication } } = request;
  const makerId = await extractUserIdFromToken(authentication);

  let makerCompany = null;
  try {
    const maker = await models.Maker.findOne({ _id: makerId })
                                    .populate({
                                      path: 'company',
                                      match: {
                                        _id: companyId
                                      }
                                    });

    makerCompany = maker.company;

  } catch (error) {
    throw Error('Invalid Company ID.');
  }

  const office = {
    ...input,
    createdAt: new Date(),
    updatedAt: new Date(),
    company: makerCompany._id
  }

  try {
    const newOffice = await new models.Office(office);
    await newOffice.save();

    await models.Company.findByIdAndUpdate(makerCompany._id,
      {
        '$push': { 'offices': newOffice.id },
        updatedAt: new Date()
      },
      { new: true }
    );

    return newOffice;
  } catch (error) {
    throw new Error(error.message || error);
  }

};

export const myOffices = async (parent, args, { models, request }) => {
  const { headers: { authentication } } = request;
  const makerId = await extractUserIdFromToken(authentication);

  try {
    const { offices } = await models.Company.findOne({ maker: makerId })
                                            .populate('offices');
    return offices;
  } catch (error) {
    return error;
  }
}

export const getOffice = async (parent, args, { models, request }) => {
  const { id: officeId } = args;
  const { headers: { authentication } } = request;
  const makerId = await extractUserIdFromToken(authentication);

  try {
    const {_id: companyId} = await models.Company.findOne({ maker: makerId });
    const office = await models.Office.findOne({
        _id: officeId,
        company: companyId
      });

    return office;
  } catch (error) {
    return error;
  }
}
