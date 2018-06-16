import AppSetting from '../models/appSetting.model';

export const getAppSetting = async () => {
  const setting = await AppSetting.findOne();
  if (!setting) {
    throw 'The setting data were not found!. Please run seeds'
  }
  return setting;
}

export const updateAppSetting = async (params) => {
  const appSetting = await getAppSetting();
  const settingUpdated = await AppSetting.findByIdAndUpdate(appSetting.id,
    params,
    { new: true }
  );
  return settingUpdated;
}
