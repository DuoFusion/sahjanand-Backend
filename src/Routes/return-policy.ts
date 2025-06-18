import express from 'express';
import { returnPolicyController } from "../controllers";

const router = express.Router();

router.post('/add/edit', returnPolicyController.add_edit_return_policy)
router.get('/', returnPolicyController.get_return_policy)

export const returnPolicyRoutes = router;