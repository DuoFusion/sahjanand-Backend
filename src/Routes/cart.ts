import { Router } from 'express';
import { cartController } from '../controllers';

const router = Router();

router.post('/add', cartController.addToCart);
router.post('/edit', cartController.updateCartItem);
router.post ('/remove', cartController.removeCartItem);
router.get('/', cartController.getCart);

export const cartRoutes = router; 