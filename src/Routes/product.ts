import { Router } from 'express';
import { productController } from '../controllers';
import { adminJWT } from '../helper';

const router = Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/best-selling', productController.getBestSelling);
router.get('/search', productController.searchProducts);

// Protected routes (admin only)
router.post('/', adminJWT, productController.createProduct);
router.put('/:id', adminJWT, productController.updateProduct);

export const productRoutes = router; 