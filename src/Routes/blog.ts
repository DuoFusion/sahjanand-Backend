import express from 'express';
import { listBlogs, getBlog, addBlog, updateBlog, deleteBlog } from '../controllers/blog';
const router = express.Router();

router.get('/', listBlogs);
router.get('/:id', getBlog);
router.post('/', addBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);

export default router; 