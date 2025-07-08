import { Router } from 'express';
import { collectionController } from '../controllers';
import { adminJWT } from '../helper';

const router = Router();

router.get('/user', collectionController.getUserCollection);
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