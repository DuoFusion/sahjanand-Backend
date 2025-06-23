import express from 'express';
import { login, createManager, logout } from '../controllers/user';
import { loginSchema, createManagerSchema } from '../validation/user';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.post('/manager/create', createManager);

export const userRoutes = router; 