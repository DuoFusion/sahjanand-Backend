import { Router } from 'express';
import { categoryController } from '../controllers';
import { adminJWT } from '../helper';

const router = Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/featured', categoryController.getFeaturedCategories);

// Protected routes (admin only)
router.post('/', adminJWT, categoryController.createCategory);
router.put('/:id', adminJWT, categoryController.updateCategory);

export const categoryRoutes = router; 