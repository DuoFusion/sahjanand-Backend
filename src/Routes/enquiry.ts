import express from 'express';
import { enquiryController } from "../controllers";
import { adminJWT } from '../helper';

const router = express.Router();

router.post('/add', enquiryController.createEnquiry)

router.use(adminJWT)
router.post('/edit', enquiryController.updateEnquiry)
router.delete('/:id', enquiryController.deleteEnquiry)
router.get('/', enquiryController.getEnquiries)

export const enquiryRoutes = router;