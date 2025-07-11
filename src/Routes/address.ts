import express from 'express';
import { addressController } from '../controllers';
import { adminJWT } from '../helper';
const router = express.Router();

router.use(adminJWT)
router.post('/add', addressController.create_address);
router.post('/edit', addressController.update_address);
router.delete('/:id', addressController.delete_address);
router.get('/', addressController.get_address);

export const addressRoutes = router;