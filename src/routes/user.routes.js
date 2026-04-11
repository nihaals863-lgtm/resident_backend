import express from 'express';
import * as userController from '../controllers/user.controller.js';
<<<<<<< HEAD
import { authMiddleware } from '../config/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/login', userController.login);

// Protected routes
router.get('/me', authMiddleware, userController.getProfile);
router.patch('/profile', authMiddleware, userController.updateProfile);
router.patch('/password', authMiddleware, userController.updatePassword);
=======

const router = express.Router();

router.get('/me', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.patch('/password', userController.updatePassword);
>>>>>>> b48dc082e40dd9b1b7d7ec9df2470b0d2555a3eb

export default router;
