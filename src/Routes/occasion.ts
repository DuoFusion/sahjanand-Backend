import { Router } from 'express';
import { occasionController } from '../controllers';
import { adminJWT, userJWT } from '../helper';

const router = Router();

router.use(userJWT)
router.get('/all', occasionController.getAllOccasions);

router.use(adminJWT)
router.post('/add', occasionController.createOccasion);
router.post('/edit', occasionController.updateOccasion);
router.delete('/:id', occasionController.deleteOccasion);
router.get('/:id', occasionController.getOccasionById);

export const occasionRoutes = router; 