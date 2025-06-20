import { apiResponse } from '../../common';
import { bannerModel } from '../../database';
import { createData, getData, reqInfo, responseMessage, updateData } from '../../helper';

export const createBanner = async (req, res) => {
    reqInfo(req);
    try {
        const body = req.body;
        const response = await createData(bannerModel, body);
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Banner'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getBanners = async (req, res) => {
    reqInfo(req);
    try {
        const { type, isActive } = req.query;
        const criteria: any = { isDeleted: false };
        if (type) criteria.type = type;
        if (isActive !== undefined) criteria.isActive = isActive === 'true';
        const response = await getData(bannerModel, criteria, {}, { sort: { priority: 1 } });
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Banners'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateBanner = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        const body = req.body;
        const response = await updateData(bannerModel, { _id: id }, body, {});
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