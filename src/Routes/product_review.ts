import { Router } from 'express';
import { addProductReview, editProductReview, deleteProductReview, listProductReviews } from '../controllers/product-review';

const router = Router();

router.post('/', addProductReview);
router.put('/:id', editProductReview);
router.delete('/:id', deleteProductReview);
router.get('/', listProductReviews);

export default router; 