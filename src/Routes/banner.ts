import express from 'express';
import { bannerController } from '../controllers';
import { validateBanner, validateSortBanners } from '../validation';

const router = express.Router();

router.get('/', bannerController.getBanners);
router.post('/add', validateBanner, bannerController.createBanner);
router.post('/sort', validateSortBanners, bannerController.sortBanners);
router.put('/:id', validateBanner, bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

export default router; 