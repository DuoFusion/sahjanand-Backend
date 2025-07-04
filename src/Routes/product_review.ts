import { Router } from 'express';
import { productReviewController } from '../controllers';
import { adminJWT } from '../helper';

const router = Router();

router.get('/user', productReviewController.getUserProductReviews);

router.use(adminJWT)

router.post('/add', productReviewController.addProductReview);
router.post('/edit', productReviewController.editProductReview);
router.delete('/delete', productReviewController.deleteProductReview);
router.get('/', productReviewController.listProductReviews);

export const productReviewRoutes = router; 