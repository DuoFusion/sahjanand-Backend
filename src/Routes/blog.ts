import express from 'express';
import { blogController } from '../controllers';
import { adminJWT } from '../helper';
const router = express.Router();

router.get('/user', blogController.listUserBlogs);
router.get('/:id', blogController.getBlog);

router.use(adminJWT)

router.post('/add', blogController.addBlog);
router.post('/edit', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);
router.get('/', blogController.listBlogs);

export const blogRoutes = router; 