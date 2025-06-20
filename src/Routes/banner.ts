import express from 'express';
import { createBanner, getBanners, updateBanner, deleteBanner, sortBanners } from '../controllers/banner';
import { validateBanner, validateSortBanners } from '../validation/banner';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

router.post('/', validateBanner, validateRequest, createBanner);
router.get('/', getBanners);
router.put('/:id', validateBanner, validateRequest, updateBanner);
router.delete('/:id', deleteBanner);
router.post('/sort', validateSortBanners, validateRequest, sortBanners);

export default router; 