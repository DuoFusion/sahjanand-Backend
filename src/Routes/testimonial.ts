import { Router } from 'express';
import { testimonialController } from '../controllers';
import { adminJWT } from '../helper';

const router = Router();

router.get('/user', testimonialController.getUserTestimonials);

router.use(adminJWT)

router.post('/add', testimonialController.addTestimonial);
router.post('/edit', testimonialController.editTestimonial);
router.delete('/delete', testimonialController.deleteTestimonial);
router.get('/', testimonialController.getTestimonials);

export const testimonialRoutes = router; 