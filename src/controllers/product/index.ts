import { apiResponse } from '../../common';
import { productModel, userModel } from '../../database';
import { createData, getData, getDataWithSorting, reqInfo, responseMessage, updateData, deleteData, countData, getFirstMatch, findAllWithPopulate, findOneAndPopulate, findAllWithPopulateWithSorting } from '../../helper';
import slugify from 'slugify';

export const productAttributePopulate = [
    { path: 'attributes.colorIds', model: 'color', select: 'name colorCode' },
    { path: 'attributes.sizeIds', model: 'size', select: 'name' },
    { path: 'attributes.materialIds', model: 'material', select: 'name' },
    { path: 'attributes.fabricIds', model: 'fabric', select: 'name' },
    { path: 'attributes.occasionIds', model: 'occasion', select: 'name' },
    { path: 'categoryId', model: 'category', select: 'name' },
    { path: 'uniqueCategoryId', model: 'unique-category', select: 'name' },
];

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
        const response = await findOneAndPopulate(productModel, { _id: new ObjectId(id) }, {}, {}, productAttributePopulate);
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
        const { categoryFilter, uniqueCategoryFilter, tag, color, size, material, fabric, occasion, sort, limit, page, showOnHomepage, search } = req.query;

        const criteria: any = { isDeleted: false, isBlocked: false };

        if (categoryFilter) criteria.categoryId = categoryFilter;
        if (uniqueCategoryFilter) criteria.uniqueCategoryId = uniqueCategoryFilter;
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

        const response = await findAllWithPopulate(productModel, criteria, {}, options, productAttributePopulate);
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

        const response = await findAllWithPopulate(productModel, criteria, {}, options, productAttributePopulate);

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

        const response = await findAllWithPopulateWithSorting(productModel, criteria, {}, options, productAttributePopulate);

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

        const response = await findAllWithPopulate(productModel, criteria, {}, {}, productAttributePopulate);

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

        const response = await findAllWithPopulateWithSorting(productModel, criteria, {}, options, productAttributePopulate);
        // Add wishlist status to each product
        const productsWithWishlistStatus = await addWishlistStatus(response, userId);
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Homepage Products'), productsWithWishlistStatus, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getProductWithFilter = async (req, res) => {
    reqInfo(req);
    let { priceFilter, categoryFilter, colorFilter, materialFilter, sortBy, uniqueCategoryFilter, bestSellingFilter, newArrivalFilter, featuredFilter } = req.query, criteria: any = {}, options: any = { lean: true }, { user } = req.headers;
    try {

        if (priceFilter) {
            criteria.salePrice = { $gte: priceFilter.min, $lte: priceFilter.max };
        }

        if (colorFilter) {
            criteria['attributes.colorIds'] = { $in: [new ObjectId(colorFilter)] };
        }

        if (materialFilter) {
            criteria['attributes.materialIds'] = { $in: [new ObjectId(materialFilter)] };
        }

        if (bestSellingFilter) {
            criteria.isBestSelling = bestSellingFilter;
        }

        if(newArrivalFilter) {
            criteria.isNewArrival = newArrivalFilter;
        }

        if(featuredFilter) {
            criteria.isFeatured = featuredFilter;
        }

        switch (sortBy) {
            case 'alphabetical_asc':
                options.sort = { name: 1 };
                break;
            case 'alphabetical_desc':
                options.sort = { name: -1 };
                break;
            case 'price_asc':
                options.sort = { salePrice: 1 };
                break;
            case 'price_desc':
                options.sort = { salePrice: -1 };
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

        if (categoryFilter) {
            criteria.categoryId = new ObjectId(categoryFilter);
        }

        if (uniqueCategoryFilter) {
            criteria.uniqueCategoryId = new ObjectId(uniqueCategoryFilter);
        }

        const products = await findAllWithPopulate(productModel, criteria, {}, options, productAttributePopulate);
        const productsWithWishlistStatus = await addWishlistStatus(products, user?._id);

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Products'), { products: productsWithWishlistStatus }, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};