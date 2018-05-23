
//TODO: Valida RUC
export const addOffice = async (parent, args, { models }) => {
  const { input } = args;
  const { companyId } = input;
  const {_id: makerId} = args.currentUser;

  let makerCompany = null;
  try {
    const maker = await models.Maker.findOne({ _id: makerId })
                                    .populate({
                                      path: 'company',
                                      match: {
                                        _id: companyId
                                      }
                                    }) || {};

    makerCompany = maker.company;

    if (!makerCompany) {
      throw Error;
    }

  } catch (error) {
    throw Error('Invalid Company ID.');
  }

  const office = {
    ...input,
    company: makerCompany._id
  }

  try {
    const newOffice = await new models.Office(office);
    await newOffice.save();

    await models.Company.findByIdAndUpdate(makerCompany._id,
      {
        '$push': { 'offices': newOffice.id }
      },
      { new: true }
    );

    return newOffice;
  } catch (error) {
    throw new Error(error.message || error);
  }

};

export const myOffices = async (parent, args, { models }) => {
  const {_id: makerId} = args.currentUser;

  try {
    const company = await models.Company.findOne({ maker: makerId })
                                        .populate('offices') || {};
    return company.offices || [];
  } catch (error) {
    return error;
  }
}

export const getOffice = async (parent, args, { models }) => {
  const { id: officeId } = args;
  const {_id: makerId} = args.currentUser;

  try {
    const company = await models.Company.findOne({ maker: makerId }) || {};
    const office = await models.Office.findOne({
        _id: officeId,
        company: company._id
      }) || {};
    office.company = company;
    return office;
  } catch (error) {
    return error;
  }
}
