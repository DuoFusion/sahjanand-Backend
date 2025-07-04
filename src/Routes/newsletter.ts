import express from 'express';
import { newsletterController } from "../controllers";
import { adminJWT } from '../helper';

const router = express.Router();
router.post('/add', newsletterController.addNewsletter)

router.use(adminJWT)
router.post('/edit', newsletterController.editNewsletter)
router.delete('/:id', newsletterController.deleteNewsletter)
router.get('/', newsletterController.getNewsletter)

export const newsletterRoutes = router; 