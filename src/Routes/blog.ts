import express from 'express';
import { blogController } from '../controllers';
const router = express.Router();

router.post('/add', blogController.addBlog);
router.post('/edit', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);
router.get('/', blogController.listBlogs);
router.get('/:id', blogController.getBlog);

export default router; 