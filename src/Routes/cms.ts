import { Router } from 'express';
import { cmsController } from '../controllers';
import { adminJWT } from '../helper';
const router = Router();

// Public routes
router.get('/content', cmsController.getCMSContent);
router.get('/whatsapp', cmsController.getWhatsAppDetails);
router.get('/social-links', cmsController.getSocialLinks);
router.get('/offer-slider', cmsController.getOfferSlider);

// Protected routes (admin only)
router.post('/content', adminJWT, cmsController.createCMSContent);
router.put('/content/:id', adminJWT, cmsController.updateCMSContent);

export const cmsRoutes = router; 