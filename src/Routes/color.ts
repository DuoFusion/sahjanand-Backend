import { Router } from 'express';
import { categoryController, colorController } from '../controllers';
import { adminJWT, userJWT } from '../helper';

const router = Router();

router.use(userJWT)
router.get('/all', colorController.getAllColors);

router.use(adminJWT)
router.post('/add', colorController.createColor);
router.post('/edit', colorController.updateColor);
router.delete('/:id', colorController.deleteColor);
router.get('/:id', colorController.getColorById);

export const colorRoutes = router; 