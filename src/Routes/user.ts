import express from 'express';
import { userController } from '../controllers';
import { adminJWT } from '../helper';

const router = express.Router();

router.post('/add', userController.add_user);
router.get('/admin/data', userController.get_admin_data);

router.use(adminJWT)
router.post('/edit', userController.edit_user_by_id);
router.post('/edit-admin', userController.edit_admin_by_id);
router.post('/wishlist/add', userController.add_to_wishlist);
router.post('/wishlist/edit', userController.remove_from_wishlist);
router.get('/wishlist', userController.get_user_wishlist);
router.get('/', userController.get_all_users);
router.get('/:id', userController.get_user_by_id);

export const userRoutes = router;