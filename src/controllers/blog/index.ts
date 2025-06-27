import { apiResponse } from '../../common';
import { blogModel } from '../../database';
import { reqInfo, responseMessage, countData } from '../../helper';

let ObjectId = require("mongoose").Types.ObjectId;

export const addBlog = async (req, res) => {
    reqInfo(req)
    try {
        const blog = new blogModel(req.body);
        await blog.save();
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Blog'), blog, {}));
    } catch (error) {
        console.log(error);
        return res.status(400).json(new apiResponse(400, responseMessage.internalServerError, {}, error));
    }
};

export const updateBlog = async (req, res) => {
    reqInfo(req)
    let body = req.body
    try {
        const blog = await blogModel.findOneAndUpdate({ _id: new ObjectId(body.blogId) }, body, { new: true })
        if (!blog) return res.status(404).json(new apiResponse(404, responseMessage.updateDataError('Blog'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Blog'), blog, {}));
    } catch (error) {
        console.log(error);
        return res.status(400).json(new apiResponse(400, responseMessage.internalServerError, {}, error));
    }
};

export const deleteBlog = async (req, res) => {
    reqInfo(req)
    try {
        const blog = await blogModel.findOneAndUpdate({ _id: new ObjectId(req.params.id), isDeleted: false }, { isDeleted: true }, { new: true });
        if (!blog) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Blog'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Blog'), blog, {}));
    } catch (error) {
        console.log(error);
        return res.status(400).json(new apiResponse(400, responseMessage.internalServerError, {}, error));
    }
};

export const listBlogs = async (req, res) => {
    reqInfo(req)
    try {
        const { search, page, limit } = req.query;
        const criteria: any = { isDeleted: false };

        if (search) {
            const regex = { $regex: search, $options: 'si' };
            criteria.$or = [
                { title: regex },
                { content: regex },
                { tags: regex },
                { metaTitle: regex },
                { metaDescription: regex },
                { metaKeywords: regex },
                { category: regex }
            ];
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const options = {
            skip: (pageNum - 1) * limitNum,
            limit: limitNum,
            sort: { createdAt: -1 }
        };

        const blogs = await blogModel.find(criteria, null, options);
        const totalCount = await countData(blogModel, criteria);

        const stateObj = {
            page: pageNum,
            limit: limitNum,
            page_limit: Math.ceil(totalCount / limitNum) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Blogs'), { blog_data: blogs, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getBlog = async (req, res) => {
    reqInfo(req)
    try {
        const blog = await blogModel.findOne({ _id: new ObjectId(req.params.id), isDeleted: false });
        if (!blog) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Blog'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Blog'), blog, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};