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
  seedDatabase();
});

const seedDatabase = () => {
    User.find({}).remove()
      .then(() => {
        User.create({
          provider: 'local',
          role: 'admin',
          name: 'Admin',
          email: 'admin@example.com',
          password: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .then(() => console.log('finished populating users'))
        .catch(err => console.log('error populating users', err));
      });
    Hunter.find({}).remove()
      .then(() => {
        Hunter.create({
          provider: 'local',
          name: 'Hunter',
          email: 'hunter@example.com',
          password: 'hunter',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .then((maker) =>{
          console.log('finished populating hunters');
          Company.create({
            businessName: 'Rumberitos',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            maker: maker._id
          }).then((company) => {
            console.log('finished populating companies');
            Office.create({
              company: company._id,
              ruc: '9999999999',
              legalRepresentative: 'Carlos Huertas',
              contributorType: 'Persona natural',
              economicActivity: 'Diseño de páginas web',
              name: 'Sucursal 1',
              address: 'La Argelia',
              email: 'sucursal1@rumberitos.com',
              createdAt: Date.now(),
              updatedAt: Date.now()
            }).then((office) => {
              console.log('finished populating offices');
              Campaign.create({
                maker: maker._id,
                updatedAt: Date.now(),
                createdAt: Date.now(),
                title: '10% de descuento en pg web',
                city: 'Loja',
                country: 'Ecuador',
                office: office._id,
                startAt: Date.now(),
                endAt: new Date().setMonth(new Date().getMonth() + 3),
                totalCoupons: 100
              }).then(() => {
                console.log('finished populating campaigns');
                mongoose.connection.close()
                process.exit();
              })
              .catch(err => console.log('error populating campaigns', err));
            })
            .catch(err => console.log('error populating offices', err));
          })
          .catch(err => console.log('error populating companies', err));
        })
        .catch(err => console.log('error populating hunters', err));
      });
    Maker.find({}).remove()
      .then(() => {
        Maker.create({
          provider: 'local',
          name: 'Maker',
          email: 'maker@example.com',
          password: 'maker',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .then(() => {
          console.log('finished populating makers')
        })
        .catch(err => console.log('error populating makers', err));
      });
}
