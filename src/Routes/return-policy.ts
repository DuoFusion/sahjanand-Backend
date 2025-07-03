import express from 'express';
import { returnPolicyController } from "../controllers";
import { adminJWT } from '../helper';

const router = express.Router();

router.get('/', returnPolicyController.get_return_policy)

router.use(adminJWT)
router.post('/add/edit', returnPolicyController.add_edit_return_policy)

export const returnPolicyRoutes = router;