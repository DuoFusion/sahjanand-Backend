import { apiResponse } from '../../common';
import { collectionModel, productModel } from '../../database';
import { reqInfo, responseMessage } from '../../helper';
import { getData, countData } from '../../helper/database_service';
import { addWishlistStatus } from '../product/index';

const ObjectId = require('mongoose').Types.ObjectId;

export const addCollection = async (req, res) => {
    reqInfo(req);
    try {
        const body = req.body;
        const collection = await new collectionModel(body).save();
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Collection'), collection, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateCollection = async (req, res) => {
    reqInfo(req);
    let body = req.body;
    try {
        const collection = await collectionModel.findOneAndUpdate({ _id: new ObjectId(body.collectionId), isDeleted: false }, body, { new: true });
        if (!collection) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Collection'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Collection'), collection, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteCollection = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        await collectionModel.findByIdAndDelete(id);
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Collection'), {}, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const assignProductsToCollection = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        const { productIds } = req.body; // array of product ObjectIds
        const collection = await collectionModel.findByIdAndUpdate(
            id,
            { $addToSet: { products: { $each: productIds } } },
            { new: true }
        );
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Collection'), collection, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const removeProductFromCollection = async (req, res) => {
    reqInfo(req);
    try {
        const { id, productId } = req.params;
        const collection = await collectionModel.findByIdAndUpdate(
            id,
            { $pull: { products: productId } },
            { new: true }
        );
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Collection'), collection, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getCollectionProducts = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        const collection = await collectionModel.findById(id).populate('products');
        if (!collection) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Collection'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Collection'), collection.products, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getCollections = async (req, res) => {
    reqInfo(req);
    let { page, limit, search, typeFilter } = req.query, criteria: any = {}, options: any = { lean: true };
    try {
        criteria.isDeleted = false;
        criteria.isBlocked = false;
        if (typeFilter) {
            criteria.type = typeFilter;
        }

        if (search) {
            criteria.$or = [
                { name: { $regex: search, $options: 'si' } },
                { description: { $regex: search, $options: 'si' } }
            ];
        }

        options.sort = { priority: 1, createdAt: -1 };

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(collectionModel, criteria, {}, options);
        const totalCount = await countData(collectionModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Collection'), {
            collection_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getUserCollection = async (req, res) => {
    reqInfo(req);
    let { typeFilter } = req.query;
    try {
        let criteria: any = {}, options: any = { lean: true };
        criteria.isDeleted = false;
        criteria.isBlocked = false;
        if (typeFilter) {
            criteria.type = typeFilter;
        }
        const collection = await getData(collectionModel, criteria, {}, options);
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Collection'), collection, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getCollectionWithProducts = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers, { id } = req.params;
    const userId = user?._id;
    try {

        const collections = await getData(collectionModel, { _id: new ObjectId(id), isDeleted: false }, {}, {});
        const collection = collections[0];
        if (!collection) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Collection'), {}, {}));

        const productIds = collection.products || [];
        const products = await getData(productModel, { _id: { $in: productIds }, isDeleted: false, isBlocked: false, }, {}, {});
        const productsWithWishlistStatus = await addWishlistStatus(products, userId);
        collection.products = productsWithWishlistStatus;
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Collection'), collection, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

// export const getCollectionFilterWithProducts = async (req, res) => {
//     reqInfo(req);
//     let { user } = req.headers, collectionCriteria: any = {}, criteria: any = {}, options: any = { lean: true }, { priceFilter, typeFilter } = req.query;
//     const userId = user?._id;
//     try {

//         if (priceFilter) {
//             criteria.price = { $gte: priceFilter.min, $lte: priceFilter.max };
//         }

//         if (typeFilter) {
//             collectionCriteria.type = typeFilter;
//             collectionCriteria.isDeleted = false;
//             collectionCriteria.isBlocked = false;
//         }
//         let collections = [];
//         if(Object.keys(collectionCriteria).length > 0){
//             collections = await getData(collectionModel, { ...collectionCriteria }, {}, {});
//         }

//         const collection = collections[0];

//         const productIds = collection?.products || [];

//         if(productIds.length > 0) {
//             criteria._id = { $in: productIds };
//         }
//         const products = await getData(productModel, { isDeleted: false, isBlocked: false, ...criteria }, {}, options);
//         const productsWithWishlistStatus = await addWishlistStatus(products, userId);
//         collection.products = productsWithWishlistStatus;
//         return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Collection'), collection, {}));
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
//     }
// };

export const getCollectionFilterWithProducts = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers, { priceFilter, categoryFilter, colorFilter, materialFilter } = req.query, collectionCriteria: any = {}, criteria: any = {}, options: any = { lean: true };
    const userId = user?._id;
    try {

        if (priceFilter) {
            criteria.salePrice = { $gte: priceFilter.min, $lte: priceFilter.max };
        }

        if (categoryFilter || colorFilter || materialFilter) {
            collectionCriteria.type = { $in: [categoryFilter, colorFilter, materialFilter] };
            collectionCriteria.isDeleted = false;
            collectionCriteria.isBlocked = false;   
        }
        let collections = [];
        if(Object.keys(collectionCriteria).length > 0){
            collections = await getData(collectionModel, { ...collectionCriteria }, {}, {});
        }
        const collection = collections[0];
        const productIds = collection?.products || [];
        
        if(productIds.length > 0) {
            criteria._id = { $in: productIds };
        }

        let productsWithWishlistStatus = [];
        const products = await getData(productModel, { isDeleted: false, isBlocked: false, ...criteria }, {}, options);
        productsWithWishlistStatus = await addWishlistStatus(products, userId);
        
        // Always return products array, even if collection is not found
        return res.status(200).json(
            new apiResponse(
                200,
                responseMessage.getDataSuccess('Collection'),
                { ...(collection || {}), products: productsWithWishlistStatus },
                {}
            )
        );
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};