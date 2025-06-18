import { apiResponse } from '../../common';
import { productModel } from '../../database';
import { createData, getData, getDataWithSorting, reqInfo, responseMessage, updateData, deleteData } from '../../helper';
import slugify from 'slugify';

let ObjectId = require('mongoose').Types.ObjectId;

export const createProduct = async (req, res) => {
    reqInfo(req)
    try {
        const body = req.body;

        // Generate slug if not provided
        if (!body.slug) {
            body.slug = slugify(body.name, { lower: true, strict: true });
        }

        const response = await createData(productModel, body);
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Product'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateProduct = async (req, res) => {
    reqInfo(req)
    try {
        const { id } = req.params;
        const body = req.body;

        // Update slug if name is changed
        if (body.name) {
            body.slug = slugify(body.name, { lower: true, strict: true });
        }

        const response = await updateData(productModel, { _id: id }, body, {});
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Product'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteProduct = async (req, res) => {
    reqInfo(req)
    try {
        const { id } = req.params;
        const response = await deleteData(productModel, { _id: new ObjectId(id) });
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Product'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getProducts = async (req, res) => {
    reqInfo(req)
    try {
        const { category, subCategory, tag, color, size, material, fabric, occasion, sort, limit = 20, page = 1, showOnHomepage } = req.query;

        const criteria: any = { isDeleted: false };

        if (category) criteria.category = category;
        if (subCategory) criteria.subCategory = subCategory;
        if (tag) criteria.tags = tag;
        if (color) criteria['attributes.color'] = color;
        if (size) criteria['attributes.size'] = size;
        if (material) criteria['attributes.material'] = material;
        if (fabric) criteria['attributes.fabric'] = fabric;
        if (occasion) criteria['attributes.occasion'] = occasion;
        if (showOnHomepage) criteria.showOnHomepage = showOnHomepage === 'true';

        const options = {
            skip: (page - 1) * limit,
            limit: parseInt(limit),
            sort: sort ? JSON.parse(sort) : { createdAt: -1 }
        };

        const response = await getDataWithSorting(productModel, criteria, {}, options);
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Products'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getNewArrivals = async (req, res) => {
    reqInfo(req)
    try {
        const { limit = 20 } = req.query;
        const criteria = { isDeleted: false, isNewArrival: true };
        const options = { limit: parseInt(limit), sort: { createdAt: -1 } };

        const response = await getDataWithSorting(productModel, criteria, {}, options);
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('New Arrivals'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getBestSelling = async (req, res) => {
    reqInfo(req)
    try {
        const { limit = 20 } = req.query;
        const criteria = { isDeleted: false, isBestSelling: true };
        const options = { limit: parseInt(limit), sort: { rating: -1 } };

        const response = await getDataWithSorting(productModel, criteria, {}, options);
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Best Selling Products'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const searchProducts = async (req, res) => {
    reqInfo(req)
    try {
        const { search } = req.query;
        const criteria: any = {
            isDeleted: false,
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
                { 'seo.keywords': { $regex: search, $options: 'i' } }
            ]
        };

        const response = await getData(productModel, criteria, {}, {});
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Search Results'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};


export const getHomepageProducts = async (req, res) => {
    reqInfo(req)
    try {
        const criteria = {
            isDeleted: false,
            showOnHomepage: true
        };
        const options = {
            sort: { createdAt: -1 },
            limit: 20
        };

        const response = await getDataWithSorting(productModel, criteria, {}, options);
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Homepage Products'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
}; 