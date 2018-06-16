// Mongo db Models
import User from '../../models/user.model';
import Maker from '../../models/maker.model';
import Hunter from '../../models/hunter.model';
import Campaign from '../../models/campaign.model';
import Company from '../../models/company.model';
import Coupon from '../../models/coupon.model';
import Office from '../../models/office.model';
import AppSetting from '../../models/appSetting.model';

const models = {
  User,
  Maker,
  Hunter,
  Campaign,
  Company,
  Coupon,
  Office,
  AppSetting
};

export default models;
