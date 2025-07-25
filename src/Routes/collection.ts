import { Router } from 'express';
import { collectionController } from '../controllers';
import { adminJWT, userJWT } from '../helper';

const router = Router();

router.use(userJWT)
router.get('/user', collectionController.getUserCollection);
router.post('/products/filter', collectionController.getCollectionFilterWithProducts);
router.get('/products/:id', collectionController.getCollectionWithProducts);

router.use(adminJWT)
router.post('/add', collectionController.addCollection);
router.post('/edit', collectionController.updateCollection);
router.delete('/:id', collectionController.deleteCollection);
router.post('/:id/products', collectionController.assignProductsToCollection);
router.delete('/:id/products/:productId', collectionController.removeProductFromCollection);
router.get('/:id/products', collectionController.getCollectionProducts);
router.get('/', collectionController.getCollections);

export const collectionRoutes = router; 