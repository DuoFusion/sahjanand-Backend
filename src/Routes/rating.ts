import express from 'express';
import { ratingController } from '../controllers';

const router = express.Router();

router.get('/product/:productId', ratingController.getRatingByProductId);

router.post('/add', ratingController.createRating);
router.post('/:id', ratingController.updateRating);
router.delete('/:id', ratingController.deleteRating);
router.get('/', ratingController.getRatings);

export const ratingRoutes = router; 