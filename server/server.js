'use strict';

import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import home from './routes/home';
import user from './routes/user';
import path from 'path';

/* eslint-disable no-console */

const port = 3000;
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/coupon-db';
const app = express();

app.set('port', port)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Api doc
app.use('/apidoc', express.static(path.join(__dirname, '..', 'apidoc')))

let v1 = express.Router()

mongoose.Promise = global.Promise;

mongoose.connect(mongoURL, { useMongoClient: true }, (error) => {
  if (error) {
    console.error('Please make sure Mongodb is installed and running!');
    throw error;
  }
});

mongoose.connection.once('open', function () {
  console.log('Mongodb: connection successful!!');
});

//////////////// API ROUTES ////////////////

//Users
v1.use('/', home);
v1.use('/users', user);

//Auth
v1.use('/auth', require('./auth').default);

////////////////////////////////////////////

// Api version
app.use('/v1', v1);

// Default API Version
app.use('/', v1);

// catch 404 and forward to error handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  })
})

app.listen(3000, function (error) {
  if (error) {
    console.log(error);
  } else {
    console.log('COUPON API is running on port', app.get('port'))
  }
});

export default app;
