'use strict';

import express from 'express';
const router = express.Router()
import * as HomeController from '../../controllers/home.controller';

router.get('/', HomeController.renderHome);

export default router;
