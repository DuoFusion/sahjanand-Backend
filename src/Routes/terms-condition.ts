import express from 'express';
import { termsConditionController } from "../controllers";
import { adminJWT } from '../helper';

const router = express.Router();

router.get('/', termsConditionController.get_terms_condition)

router.use(adminJWT)
router.post('/add/edit', termsConditionController.add_edit_terms_condition)

export const termsConditionRoutes = router;