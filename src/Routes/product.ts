import { Router } from 'express';
import { productController } from '../controllers';
import { adminJWT } from '../helper';

const router = Router();
// Public routes
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/best-selling', productController.getBestSelling);
router.get('/search', productController.searchProducts);
router.get('/homepage', productController.getHomepageProducts);

router.use(adminJWT)
router.post('/add', productController.createProduct);
router.post('/edit', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.get('/', productController.getProducts);

export const productRoutes = router; 