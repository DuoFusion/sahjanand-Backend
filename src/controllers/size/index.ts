import { createData, getData, updateData, deleteData, reqInfo, responseMessage, countData } from "../../helper";
import { apiResponse } from "../../common";
import { sizeModel } from "../../database";

const ObjectId = require("mongoose").Types.ObjectId;

export const createSize = async (req, res) => {
    reqInfo(req)
    const body = req.body;
    try {

        let isExist = await sizeModel.findOne({ name: body.name, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Name"), {}, {}));
        
        isExist = await sizeModel.findOne({ priority: body.priority, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Priority"), {}, {}));

        const response = await createData(sizeModel, body);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.addDataError, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('size'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateSize = async (req, res) => {
    reqInfo(req)
    let body = req.body;
    try {

        let isExist = await sizeModel.findOne({ name: body.name, isDeleted: false, _id: { $ne: new ObjectId(body.sizeId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Name"), {}, {}));
        
        isExist = await sizeModel.findOne({ priority: body.priority, isDeleted: false, _id: { $ne: new ObjectId(body.sizeId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Priority"), {}, {}));

        const response = await updateData(sizeModel, { _id: new ObjectId(body.sizeId), isDeleted: false }, body, {});
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.updateDataError('size'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('size'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteSize = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await deleteData(sizeModel, { _id: new ObjectId(id), isDeleted: false });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('size'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('size'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getAllSizes = async (req, res) => {
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

        const response = await getData(sizeModel, criteria, {}, options);
        const totalCount = await countData(sizeModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('size'), {
            size_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getSizeById = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await getData(sizeModel, { _id: new ObjectId(id), isDeleted: false }, {}, {});
        if (!response || response.length === 0) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('size'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('size'), response[0], {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};