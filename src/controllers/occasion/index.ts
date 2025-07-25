import { createData, getData, updateData, deleteData, reqInfo, responseMessage, countData, updateMany } from "../../helper";
import { apiResponse } from "../../common";
import { occasionModel, productModel } from "../../database";

const ObjectId = require("mongoose").Types.ObjectId;

export const createOccasion = async (req, res) => {
    reqInfo(req)
    const body = req.body;
    try {

        let isExist = await occasionModel.findOne({ name: body.name, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Name"), {}, {}));
        
        isExist = await occasionModel.findOne({ priority: body.priority, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Priority"), {}, {}));

        const response = await createData(occasionModel, body);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.addDataError, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Occasion'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateOccasion = async (req, res) => {
    reqInfo(req)
    let body = req.body;
    try {

        let isExist = await occasionModel.findOne({ name: body.name, isDeleted: false, _id: { $ne: new ObjectId(body.occasionId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Name"), {}, {}));
        
        isExist = await occasionModel.findOne({ priority: body.priority, isDeleted: false, _id: { $ne: new ObjectId(body.occasionId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Priority"), {}, {}));

        const response = await updateData(occasionModel, { _id: new ObjectId(body.occasionId), isDeleted: false }, body, {});
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.updateDataError('Occasion'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Occasion'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteOccasion = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await deleteData(occasionModel, { _id: new ObjectId(id), isDeleted: false });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Occasion'), {}, {}));

        await updateMany(productModel, { 'attributes.occasionIds': new ObjectId(id) }, { $pull: { 'attributes.occasionIds': new ObjectId(id) } }, {});

        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Occasion'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getAllOccasions = async (req, res) => {
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

        const response = await getData(occasionModel, criteria, {}, options);
        const totalCount = await countData(occasionModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Occasion'), {
            occasion_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getOccasionById = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await getData(occasionModel, { _id: ObjectId(id), isDeleted: false }, {}, {});
        if (!response || response.length === 0) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Occasion'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Occasion'), response[0], {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};