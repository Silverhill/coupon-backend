import * as SettingService from '../../../services/setting.service';


export const updateAppSetting = async (parent, args) => {
  const { input: newSetting } = args;
  const settingUpdated = await SettingService.updateAppSetting(newSetting);
  return settingUpdated;
};

export const getAppSetting = async () => {
  const appSetting = await SettingService.getAppSetting();
  return appSetting;
};

