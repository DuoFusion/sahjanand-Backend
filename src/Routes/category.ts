import { Router } from 'express';
import { categoryController } from '../controllers';
import { adminJWT } from '../helper';

const router = Router();

// Public routes
router.post('/add', categoryController.createCategory);
router.post('/edit', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.get('/featured', categoryController.getFeaturedCategories);
router.get('/', categoryController.getCategories);

// Protected routes (admin only)

export const categoryRoutes = router; 