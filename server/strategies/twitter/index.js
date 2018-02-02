'use strict';

import express from 'express';
import passport from 'passport';
import {setTokenCookie} from '../../services/auth.service';

var router = express.Router();

router
  .get('/', passport.authenticate('twitter', {
    scope: ['profile', 'email'],
    failureRedirect: '/signup',
    session: false
  }))
  .get('/callback', passport.authenticate('twitter', {
    failureRedirect: '/signup',
    session: false
  }), setTokenCookie);

export default router;
