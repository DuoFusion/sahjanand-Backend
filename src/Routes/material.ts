import { Router } from 'express';
import { materialController } from '../controllers';
import { adminJWT, userJWT } from '../helper';

const router = Router();

router.use(userJWT)
router.get('/all', materialController.getAllMaterials);

router.use(adminJWT)
router.post('/add', materialController.createMaterial);
router.post('/edit', materialController.updateMaterial);
router.delete('/:id', materialController.deleteMaterial);
router.get('/:id', materialController.getMaterialById);

export const materialRoutes = router; 