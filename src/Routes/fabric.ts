import { Router } from 'express';
import { fabricController } from '../controllers';
import { adminJWT, userJWT } from '../helper';

const router = Router();

router.use(userJWT)
router.get('/all', fabricController.getAllFabrics);

router.use(adminJWT)
router.post('/add', fabricController.createFabric);
router.post('/edit', fabricController.updateFabric);
router.delete('/:id', fabricController.deleteFabric);
router.get('/:id', fabricController.getFabricById);

export const fabricRoutes = router; 