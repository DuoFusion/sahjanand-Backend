import { Router } from 'express';
import { addTestimonial, editTestimonial, deleteTestimonial, listTestimonials } from '../controllers/testimonial';

const router = Router();

router.post('/', addTestimonial);
router.put('/:id', editTestimonial);
router.delete('/:id', deleteTestimonial);
router.get('/', listTestimonials);

export default router; 