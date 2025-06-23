import { blogModel } from '../../database/models/blog';
import { Request, Response } from 'express';

export const listBlogs = async (req: Request, res: Response) => {
    try {
        const blogs = await blogModel.find({ isDeleted: false });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
};

export const getBlog = async (req: Request, res: Response) => {
    try {
        const blog = await blogModel.findOne({ _id: req.params.id, isDeleted: false });
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch blog' });
    }
};

export const addBlog = async (req: Request, res: Response) => {
    try {
        const blog = new blogModel(req.body);
        await blog.save();
        res.status(201).json(blog);
    } catch (err) {
        res.status(400).json({ error: 'Failed to add blog', details: err });
    }
};

export const updateBlog = async (req: Request, res: Response) => {
    try {
        const blog = await blogModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        res.status(400).json({ error: 'Failed to update blog', details: err });
    }
};

export const deleteBlog = async (req: Request, res: Response) => {
    try {
        const blog = await blogModel.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json({ message: 'Blog deleted' });
    } catch (err) {
        res.status(400).json({ error: 'Failed to delete blog', details: err });
    }
}; 