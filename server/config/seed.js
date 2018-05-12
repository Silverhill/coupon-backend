/* eslint-disable no-console */

'use strict';
import mongoose from 'mongoose';
import User from '../models/user.model';
import Hunter from '../models/hunter.model';
import Maker from '../models/maker.model';
import Company from '../models/company.model';
import Office from '../models/office.model';
import Campaign from '../models/campaign.model';
import config from './';

mongoose.Promise = global.Promise;

mongoose.connect(config.mongoUrl, { useMongoClient: true }, (error) => {
  if (error) {
    console.error('Please make sure Mongodb is installed and running!');
    throw error;
  }
});

mongoose.connection.once('open', function () {
  console.log('Mongodb: connection successful!!');
  seedDatabase().then(()=>{
    console.log('finished');
    mongoose.connection.close()
    process.exit();
  });
});

const dropAll = async () => {
  await User.find({}).remove();
  await Company.find({}).remove();
  await Office.find({}).remove();
  await Campaign.find({}).remove();
}

const seedDatabase = async () => {
  console.log('first drop all');
  await dropAll();
  await User.create({
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin'
  });
  let maker = await Maker.create({
    provider: 'local',
    name: 'Maker',
    email: 'maker@example.com',
    password: 'maker'
  });
  let company = await Company.create({
   businessName: 'Rumberitos',
   maker: maker._id
  });

  await Maker.findByIdAndUpdate(maker._id,
    {
      company: company._id
    },
    { new: true }
  );

  let office = await Office.create({
    company: company._id,
    ruc: '9999999999',
    legalRepresentative: 'Carlos Huertas',
    contributorType: 'Persona natural',
    economicActivity: 'Diseño de páginas web',
    name: 'Sucursal 1',
    address: 'La Argelia',
    email: 'sucursal1@rumberitos.com'
  });

  await Company.findByIdAndUpdate(company._id,
    {
      '$push': { 'offices': office._id }
    },
    { new: true }
  );

  let campaign = await Campaign.create({
    maker: maker._id,
    title: '10% de descuento en pg web',
    city: 'Loja',
    country: 'Ecuador',
    office: office._id,
    startAt: Date.now(),
    endAt: new Date().setMonth(new Date().getMonth() + 3),
    totalCoupons: 100
  });

  await Office.findByIdAndUpdate(office._id,
    {
      '$push': { 'campaigns': campaign._id }
    },
    { new: true }
  );

  await Maker.findByIdAndUpdate(maker._id,
    {
      '$push': { 'campaigns': campaign._id }
    },
    { new: true }
  );

  await Hunter.create({
    provider: 'local',
    name: 'Hunter',
    email: 'hunter@example.com',
    password: 'hunter'
  });
}
