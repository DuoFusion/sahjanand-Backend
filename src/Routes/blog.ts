import express from 'express';
import { listBlogs, getBlog, addBlog, updateBlog, deleteBlog } from '../controllers/blog';
const router = express.Router();

router.post('/add', addBlog);
router.post('/edit', updateBlog);
router.get('/', listBlogs);
router.get('/:id', getBlog);
router.delete('/:id', deleteBlog);

export default router; 