import express from 'express';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

router.get('/me', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.patch('/password', userController.updatePassword);

export default router;
