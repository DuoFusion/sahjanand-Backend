import { Router } from 'express';
import { categoryController } from '../controllers';
import { adminJWT, userJWT } from '../helper';

const router = Router();

router.use(userJWT)
router.get('/user', categoryController.getUserCategory);

router.use(adminJWT)
router.post('/add', categoryController.createCategory);
router.post('/edit', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.get('/featured', categoryController.getFeaturedCategories);
router.get('/', categoryController.getCategories);

export const categoryRoutes = router; 