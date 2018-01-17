'use strict';

import express from 'express';
import passport from 'passport';
import {setTokenCookie} from '../../services/auth.service';

var router = express.Router();

router
  .get('/', passport.authenticate('google', {
    scope: ['profile', 'email'],
    failureRedirect: '/signup',
    session: false
  }))
  .get('/callback', passport.authenticate('google', {
    failureRedirect: '/signup',
    session: false
  }), setTokenCookie);

export default router;
