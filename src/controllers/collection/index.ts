import { apiResponse } from '../../common';
import { collectionModel } from '../../database';
import { reqInfo, responseMessage } from '../../helper';
import { getData, countData } from '../../helper/database_service';

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
    let { page, limit, search, type } = req.query, criteria: any = {}, options: any = { lean: true };
    try {
        if (type) {
            criteria.type = type;
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