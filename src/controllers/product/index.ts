import { apiResponse } from '../../common';
import { productModel, userModel } from '../../database';
import { createData, getData, getDataWithSorting, reqInfo, responseMessage, updateData, deleteData, countData, getFirstMatch } from '../../helper';
import slugify from 'slugify';

let ObjectId = require('mongoose').Types.ObjectId;

// Helper function to add wishlist status to products
export const addWishlistStatus = async (products, userId) => {
    if (!userId) {
        return products.map(product => ({
            ...product,
            isInWishlist: false
        }));
    }

    const user = await userModel.findById(userId).select('wishlists').lean();

    const userWishlist = user?.wishlists || [];

    return products.map(product => ({
        ...product,
        isInWishlist: userWishlist.map(id => id.toString()).includes(product._id.toString())
    }));
};

export const addWishlistStatusToProduct = async (product, userId) => {
    if (!userId || !product) {
        return { ...product, isInWishlist: false };
    }
    const user = await userModel.findById(userId).select('wishlists').lean();
    const userWishlist = user?.wishlists || [];
    return {
        ...product,
        isInWishlist: userWishlist.map(id => id.toString()).includes(product._id.toString())
    };
};

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
        const { productId } = req.body;
        const body = req.body;

        // Update slug if name is changed
        if (body.name) {
            body.slug = slugify(body.name, { lower: true, strict: true });
        }

        const response = await updateData(productModel, { _id: new ObjectId(productId) }, body, {});
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

export const getProductById = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers;
    const userId = user?._id;
    try {
        const { id } = req.params;
        const response = await getFirstMatch(productModel, { _id: new ObjectId(id) }, {}, {});
        const productWithWishlistStatus = await addWishlistStatusToProduct(response, userId);
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Product'), productWithWishlistStatus, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
}

export const getProducts = async (req, res) => {
    reqInfo(req)
    try {
        const { category, subCategory, tag, color, size, material, fabric, occasion, sort, limit, page, showOnHomepage, search } = req.query;

        const criteria: any = { isDeleted: false, isBlocked: false };

        if (category) criteria.categoryId = category;
        if (subCategory) criteria.subCategoryId = subCategory;
        if (tag) criteria.tags = tag;
        if (color) criteria['attributes.color'] = color;
        if (size) criteria['attributes.size'] = size;
        if (material) criteria['attributes.material'] = material;
        if (fabric) criteria['attributes.fabric'] = fabric;
        if (occasion) criteria['attributes.occasion'] = occasion;
        if (showOnHomepage) criteria.showOnHomepage = showOnHomepage === 'true';

        if (search) {
            criteria.$or = [
                { name: { $regex: search, $options: 'si' } },
                { description: { $regex: search, $options: 'si' } },
                { tags: { $regex: search, $options: 'si' } }
            ];
        }

        // Parse pagination params
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;

        const options = {
            skip: (pageNum - 1) * limitNum,
            limit: limitNum,
            sort: sort ? JSON.parse(sort) : { createdAt: -1 }
        };

        const response = await getDataWithSorting(productModel, criteria, {}, options);
        const totalCount = await countData(productModel, criteria);

        const stateObj = {
            page: pageNum,
            limit: limitNum,
            page_limit: Math.ceil(totalCount / limitNum) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Products'), { product_data: response, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getNewArrivals = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers;
    const userId = user?._id;
    try {
        const { limit = 20 } = req.query;
        const criteria = { isDeleted: false, isBlocked: false, isNewArrival: true };
        const options = { limit: parseInt(limit), sort: { createdAt: -1 } };

        const response = await getDataWithSorting(productModel, criteria, {}, options);

        const productsWithWishlistStatus = await addWishlistStatus(response, userId);

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('New Arrivals'), productsWithWishlistStatus, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getBestSelling = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers;
    const userId = user?._id;
    try {
        const { limit = 20 } = req.query;
        const criteria = { isDeleted: false, isBlocked: false, isBestSelling: true };
        const options = { limit: parseInt(limit), sort: { rating: -1 } };

        const response = await getDataWithSorting(productModel, criteria, {}, options);

        // Add wishlist status to each product
        const productsWithWishlistStatus = await addWishlistStatus(response, userId);

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Best Selling Products'), productsWithWishlistStatus, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const searchProducts = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers;
    try {
        const userId = user?._id;
        const { search } = req.query;
        let criteria: any = {
            isDeleted: false,
            isBlocked: false
        };
        if (search) {
            criteria.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
                { 'seo.keywords': { $regex: search, $options: 'i' } }
            ]
        }

        const response = await getData(productModel, criteria, {}, {});

        // Add wishlist status to each product
        const productsWithWishlistStatus = await addWishlistStatus(response, userId);

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Search Results'), productsWithWishlistStatus, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getHomepageProducts = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers;
    try {
        const userId = user?._id;
        const criteria = {
            isDeleted: false,
            isBlocked: false,
            showOnHomepage: true
        };
        const options = {
            sort: { createdAt: -1 },
            limit: 20
        };

        const response = await getDataWithSorting(productModel, criteria, {}, options);
        // Add wishlist status to each product
        const productsWithWishlistStatus = await addWishlistStatus(response, userId);
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Homepage Products'), productsWithWishlistStatus, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getProductByFilter = async (req, res) => {
    reqInfo(req);
    let { page, limit, categoryId, tags, attributes, search, sortBy } = req.query;
    let criteria: any = { isDeleted: false, isBlocked: false };
    let options: any = { lean: true };

    try {
        if (categoryId) {
            criteria["$or"] = [
                { categoryId },
                { subCategoryId: categoryId }
            ];
        }

        if (tags) {
            if (Array.isArray(tags)) {
                criteria.tags = { $in: tags };
            } else {
                criteria.tags = { $in: tags.split(',') };
            }
        }

        if (attributes) {
            let attr = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
            for (let key in attr) {
                if (Array.isArray(attr[key])) {
                    criteria[`attributes.${key}`] = { $in: attr[key] };
                } else {
                    criteria[`attributes.${key}`] = attr[key];
                }
            }
        }

        if (search) {
            criteria.$text = { $search: search };
        }

        switch (sortBy) {
            case 'alphabetical_asc':
                options.sort = { name: 1 };
                break;
            case 'alphabetical_desc':
                options.sort = { name: -1 };
                break;
            case 'price_asc':
                options.sort = { price: 1 };
                break;
            case 'price_desc':
                options.sort = { price: -1 };
                break;
            case 'best_selling':
                criteria.isBestSelling = true;
                break;
            case 'new_arrival':
                criteria.isNewArrival = true;
                break;
            default:
                options.sort = { isBestSelling: -1, createdAt: -1 };
                break;
        }

        // Pagination
        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const products = await productModel.find(criteria, {}, options).lean();

        const totalCount = await productModel.countDocuments(criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Products'), {
            product_data: products,
            totalData: totalCount,
            state: stateObj
        }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};