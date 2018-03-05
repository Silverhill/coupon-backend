import mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose-fix';
import config from '../../server/config'

let mockgoose = new Mockgoose(mongoose);
mockgoose.helper.setDbVersion('3.4.3');

export function connectDB() {
  return new Promise((resolve, reject) => {
    mockgoose.prepareStorage().then(() => {
      mongoose.connect(config.mongoUrl, { useMongoClient: true }, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      });
    });
  })
}

export function dropDB() {
  return new Promise((resolve, reject) => {
    mockgoose.helper.reset().then(err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    });
  });
}
