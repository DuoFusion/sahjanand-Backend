import express from 'express';
import { faqController } from "../controllers";
import { adminJWT, userJWT } from '../helper';

const router = express.Router();

router.use(userJWT)
router.get('/', faqController.get_all_faqs)

router.use(adminJWT)
router.post('/add', faqController.add_faq)
router.post('/edit', faqController.edit_faq)
router.delete('/:id', faqController.delete_faq)
router.get('/:id', faqController.get_faq_by_id)

export const faqRoutes = router; 