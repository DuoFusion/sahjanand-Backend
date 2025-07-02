import { Router } from 'express';
import { testimonialController } from '../controllers';

const router = Router();

router.post('/add', testimonialController.addTestimonial);
router.post('/edit', testimonialController.editTestimonial);
router.delete('/delete', testimonialController.deleteTestimonial);
router.get('/', testimonialController.listTestimonials);

export const testimonialRoutes = router; 