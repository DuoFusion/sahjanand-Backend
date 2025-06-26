import express from 'express';
import { bannerController } from '../controllers';
import { validateBanner, validateSortBanners } from '../validation';

const router = express.Router();

router.post('/add', bannerController.createBanner);
router.post('/edit', bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);
router.get('/', bannerController.getBanners);
router.post('/sort', bannerController.sortBanners);

export const bannerRoutes = router; 