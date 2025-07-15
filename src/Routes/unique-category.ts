import { Router } from 'express';
import { uniqueCategoryController } from '../controllers';
import { adminJWT, userJWT } from '../helper';

const router = Router();

router.use(userJWT)
router.get('/all', uniqueCategoryController.getAllUniqueCategories);

router.use(adminJWT)
router.post('/add', uniqueCategoryController.createUniqueCategory);
router.post('/edit', uniqueCategoryController.updateUniqueCategory);
router.delete('/:id', uniqueCategoryController.deleteUniqueCategory);
router.get('/:id', uniqueCategoryController.getUniqueCategoryById);

export const uniqueCategoryRoutes = router;