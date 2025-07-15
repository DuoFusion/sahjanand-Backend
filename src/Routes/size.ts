import { Router } from 'express';
import { sizeController } from '../controllers';
import { adminJWT, userJWT } from '../helper';

const router = Router();

router.use(userJWT)
router.get('/all', sizeController.getAllSizes);

router.use(adminJWT)
router.post('/add', sizeController.createSize);
router.post('/edit', sizeController.updateSize);
router.delete('/:id', sizeController.deleteSize);
router.get('/:id', sizeController.getSizeById);

export const sizeRoutes = router; 