'use strict';

import express from 'express';
const router = express.Router()
import config from '../../config';
import User from '../../models/user.model';
import local from '../../strategies/local'
import facebook from '../../strategies/facebook'
import google from '../../strategies/google'
import twitter from '../../strategies/twitter'
import * as passportLocal from '../../strategies/local/passport'
import * as passportFacebook from '../../strategies/facebook/passport'
import * as passportGoogle from '../../strategies/google/passport'
import * as passportTwitter from '../../strategies/twitter/passport'

// Passport Configuration
passportLocal.setup(User, config);
passportFacebook.setup(User, config);
passportGoogle.setup(User, config);
passportTwitter.setup(User, config);

router.use('/local', local);
router.use('/facebook', facebook);
router.use('/google', google);
router.use('/twitter', twitter);

export default router;
