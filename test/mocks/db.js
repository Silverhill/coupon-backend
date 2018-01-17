import * as mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose-fix';

let mockgoose = new Mockgoose(mongoose);
mockgoose.helper.setDbVersion('3.4.3');

export function connectDB(t, done) {
  mockgoose.prepareStorage().then(() => {
    mongoose.connect('mongodb://localhost:27017/coupon-db-test', { useMongoClient: true }, (err) => {
      done(err);
    });
  });
}

export function dropDB(t) {
  mockgoose.helper.reset().then(err => {
    if (err) t.fail('Unable to reset test database');
  });
}
