'use strict';

import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import mkdirp from 'mkdirp';
import home from './routes/home';
import user from './routes/user';
import auth from './routes/auth';
import graphql from './routes/graphql';
import path from 'path';
import session from 'express-session'
import config from './config'
import cloudinary from 'cloudinary';
import 'babel-polyfill';

/* eslint-disable no-console */

const app = express();

app.use(session({
  secret: 'couponsecret123',
  resave: false,
  saveUninitialized: true
}));

app.set('port', config.port)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Api doc
app.use('/apidoc', express.static(path.join(__dirname, '..', 'apidoc')))

let v1 = express.Router()

mongoose.Promise = global.Promise;

mongoose.connect(config.mongoUrl, { useMongoClient: true }, (error) => {
  if (error) {
    console.error('Please make sure Mongodb is installed and running!');
    throw error;
  }
});

mongoose.connection.once('open', function () {
  console.log('Mongodb: connection successful!!');
});

//////////////// API ROUTES ////////////////
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authentication");
  if ('OPTIONS' === req.method) {
    res.send(200);
  }
  else {
    next();
  }
});
//Users
v1.use('/', home);
v1.use('/users', user);
v1.use('/', graphql);

//Auth
v1.use('/auth', auth);

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

app.listen(app.get('port'), function (error) {
  if (error) {
    console.log(error);
  } else {
    console.log('COUPON API is running on port', app.get('port'))
  }
});

mkdirp.sync(config.uploadsFolder);

cloudinary.config(config.cloudinary);

export default app;
