import { apiResponse } from '../../common';
import { bannerModel } from '../../database';
import { createData, getData, reqInfo, responseMessage, updateData, countData } from '../../helper';

let ObjectId = require("mongoose").Types.ObjectId;

export const createBanner = async (req, res) => {
    reqInfo(req);
    try {
        const body = req.body;

        let isExist = await bannerModel.findOne({ type: body.type, priority: body.priority, isDeleted: false });
        if (isExist) return res.status(400).json(new apiResponse(400, responseMessage.dataAlreadyExist('priority'), {}, {}));

        const response = await createData(bannerModel, body)
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Banner'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateBanner = async (req, res) => {
    reqInfo(req);
    try {
        const body = req.body;

        let isExist = await bannerModel.findOne({ type: body.type, priority: body.priority, isDeleted: false, _id: { $ne: new ObjectId(body.bannerId) } });
        if (isExist) return res.status(400).json(new apiResponse(400, responseMessage.dataAlreadyExist('priority'), {}, {}));

        const response = await updateData(bannerModel, { _id: new ObjectId(body.bannerId) }, body, {});
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Banner'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteBanner = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        const response = await updateData(bannerModel, { _id: id }, { isDeleted: true }, {});
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Banner'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getBanners = async (req, res) => {
    reqInfo(req);
    try {
        const { type, isActive, search, page, limit, typeFilter } = req.query;
        const criteria: any = { isDeleted: false };
        if (type) criteria.type = type;
        if (isActive !== undefined) criteria.isActive = isActive === 'true';
        if (search) {
            criteria.title = { $regex: search, $options: 'i' };
        }
        if (typeFilter) {
            criteria.type = typeFilter;
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const options = {
            skip: (pageNum - 1) * limitNum,
            limit: limitNum,
            sort: { createdAt: -1 }
        };

        const response = await bannerModel.find(criteria, null, options);
        const totalCount = await countData(bannerModel, criteria);

        const stateObj = {
            page: pageNum,
            limit: limitNum,
            page_limit: Math.ceil(totalCount / limitNum) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Banners'), { banner_data: response, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const sortBanners = async (req, res) => {
    reqInfo(req);
    try {
        const { sortedIds } = req.body; // Array of banner IDs in new order
        if (!Array.isArray(sortedIds)) {
            return res.status(400).json(new apiResponse(400, 'sortedIds must be an array', {}, {}));
        }
        for (let i = 0; i < sortedIds.length; i++) {
            await updateData(bannerModel, { _id: sortedIds[i] }, { priority: i }, {});
        }
        return res.status(200).json(new apiResponse(200, 'Banner priorities updated', {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
}; 