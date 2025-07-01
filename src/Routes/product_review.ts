import { Router } from 'express';
import { productReviewController } from '../controllers';

const router = Router();

router.post('/add', productReviewController.addProductReview);
router.post('/edit', productReviewController.editProductReview);
router.delete('/delete', productReviewController.deleteProductReview);
router.get('/', productReviewController.listProductReviews);

export const productReviewRoutes = router; 