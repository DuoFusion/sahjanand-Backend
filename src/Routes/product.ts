import { Router } from 'express';
import { productController } from '../controllers';
import { adminJWT, userJWT } from '../helper';

const router = Router();
// Public routes
router.use(userJWT)
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/best-selling', productController.getBestSelling);
router.get('/search', productController.searchProducts);
router.get('/homepage', productController.getHomepageProducts);
// router.get('/product/:id', productController.getProductById);

router.use(adminJWT)
router.post('/add', productController.createProduct);
router.post('/edit', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

export const productRoutes = router; 