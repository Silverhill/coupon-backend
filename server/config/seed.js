/* eslint-disable no-console */

'use strict';
import User from '../models/user.model';
import Hunter from '../models/hunter.model';
import Maker from '../models/maker.model';
import config from './';

const seedDatabaseIfNeeded = async () => {
  const users = await User.find();

  if(config.seedDB && !users.length) {
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
        .then(() => console.log('finished populating hunters'))
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
        .then(() => console.log('finished populating makers'))
        .catch(err => console.log('error populating makers', err));
      });
  }
}

export default seedDatabaseIfNeeded;
