import { Router } from 'express';
import { productController } from '../controllers';
import { adminJWT } from '../helper';

const router = Router();

// Public routes
router.post('/add', productController.createProduct);
router.post('/edit', productController.updateProduct);
router.get('/', productController.getProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/best-selling', productController.getBestSelling);
router.get('/search', productController.searchProducts);

// Protected routes (admin only)

export const productRoutes = router; 