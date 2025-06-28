import express from 'express';
import { faqController } from "../controllers";

const router = express.Router();

// Admin routes
router.post('/add', faqController.add_faq)
router.post('/edit', faqController.edit_faq)
router.delete('/:id', faqController.delete_faq)

// Public routes
router.get('/', faqController.get_all_faqs)
router.get('/:id', faqController.get_faq_by_id)

export const faqRoutes = router; 