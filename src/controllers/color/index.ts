import { createData, getData, updateData, deleteData, reqInfo, responseMessage, countData } from "../../helper";
import { apiResponse } from "../../common";
import { colorModel } from "../../database";

const ObjectId = require("mongoose").Types.ObjectId;

export const createColor = async (req, res) => {
    reqInfo(req)
    const body = req.body;
    try {

        let isExist = await colorModel.findOne({ name: body.name, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Name"), {}, {}));
        
        isExist = await colorModel.findOne({ priority: body.priority, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Priority"), {}, {}));

        const response = await createData(colorModel, body);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.addDataError, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Color'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateColor = async (req, res) => {
    reqInfo(req)
    let body = req.body;
    try {

        let isExist = await colorModel.findOne({ name: body.name, isDeleted: false, _id: { $ne: new ObjectId(body.colorId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Name"), {}, {}));
        
        isExist = await colorModel.findOne({ priority: body.priority, isDeleted: false, _id: { $ne: new ObjectId(body.colorId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Priority"), {}, {}));

        const response = await updateData(colorModel, { _id: new ObjectId(body.colorId), isDeleted: false }, body, {});
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.updateDataError('Color'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Color'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteColor = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await deleteData(colorModel, { _id: new ObjectId(id), isDeleted: false });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Color'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Color'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getAllColors = async (req, res) => {
    reqInfo(req);
    let { page, limit, search } = req.query, criteria: any = {}, options: any = { lean: true };
    try {
        criteria.isDeleted = false;

        if (search) {
            criteria.$or = [
                { name: { $regex: search, $options: 'si' } },
            ];
        }

        options.sort = { priority: 1 };

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(colorModel, criteria, {}, options);
        const totalCount = await countData(colorModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Color'), {
            color_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getColorById = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await getData(colorModel, { _id: new ObjectId(id), isDeleted: false }, {}, {});
        if (!response || response.length === 0) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Color'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Color'), response[0], {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};