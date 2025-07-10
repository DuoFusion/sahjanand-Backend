import express from 'express';
import { addressController } from '../controllers';
import { adminJWT } from '../helper';
const router = express.Router();


router.use(adminJWT)
router.get('/', addressController.get_address);

export const addressRoutes = router; 