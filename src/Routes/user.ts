import express from 'express';
import { login, createManager, logout } from '../controllers/user';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/checkPermission';
import { loginSchema, createManagerSchema } from '../validation/user';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Public routes
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', authenticate, logout);

// Protected routes
router.post('/manager/create', 
    authenticate, 
    checkPermission('user', 'create'),
    validateRequest(createManagerSchema),
    createManager
);

export const userRoutes = router; 