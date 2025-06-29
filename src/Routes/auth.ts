import { Router } from 'express';
import { authController } from '../controllers';

const router = Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/reset-password', authController.reset_password);

export const authRoutes = router; 