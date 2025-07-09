import { ADMIN_ROLES, apiResponse } from '../../common';
import { ratingModel } from '../../database';
import { createData, getData, reqInfo, responseMessage, updateData, countData } from '../../helper';

let ObjectId = require("mongoose").Types.ObjectId;

export const createRating = async (req, res) => {
    reqInfo(req);
    let body = req.body, { user } = req.headers;
    try {
        body.userId = user?._id;
        const response = await createData(ratingModel, body)
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Rating'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateRating = async (req, res) => {
    reqInfo(req);
    const body = req.body;
    try {
        const response = await updateData(ratingModel, { _id: new ObjectId(body.ratingId) }, body, {});
        if (!response) return res.status(400).json(new apiResponse(400, responseMessage.updateDataError('Rating'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Rating'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteRating = async (req, res) => {
    reqInfo(req);
    const { id } = req.params;
    try {
        const response = await updateData(ratingModel, { _id: new ObjectId(id) }, { isDeleted: true }, {});
        if (!response) return res.status(400).json(new apiResponse(400, responseMessage.getDataNotFound('Rating'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Rating'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getRatings = async (req, res) => {
    reqInfo(req);
    let { page, limit, productId } = req.query, options: any = { lean: true }, criteria: any = { isDeleted: false }, { user } = req.headers;
    try {
        if(productId) criteria.productId = new ObjectId(productId);
        
        options.sort = { createdAt: -1 };

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 0;

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(ratingModel, criteria, {}, options);
        const totalCount = await countData(ratingModel, criteria);

        const stateObj = {
            page: pageNum,
            limit: limitNum,
            page_limit: Math.ceil(totalCount / limitNum) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Ratings'), { rating_data: response, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};