import express from 'express';
import { roleController } from '../controllers';

const router = express.Router();

router.post('/add', roleController.add_role);
router.post('/:id', roleController.edit_role_by_id);
router.delete('/:id', roleController.delete_role_by_id);
router.get('/', roleController.get_all_role);
router.get('/:id', roleController.get_by_id_role);

export const roleRoutes = router; 