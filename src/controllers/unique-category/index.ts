import { createData, getData, updateData, deleteData, reqInfo, responseMessage, countData } from "../../helper";
import { apiResponse } from "../../common";
import { uniqueCategoryModel } from "../../database";

const ObjectId = require("mongoose").Types.ObjectId;

export const createUniqueCategory = async (req, res) => {
    reqInfo(req)
    const body = req.body;
    try {

        let isExist = await uniqueCategoryModel.findOne({ name: body.name, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Name"), {}, {}));

        const response = await createData(uniqueCategoryModel, body);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.addDataError, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Unique Category'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateUniqueCategory = async (req, res) => {
    reqInfo(req)
    let body = req.body;
    try {

        let isExist = await uniqueCategoryModel.findOne({ name: body.name, isDeleted: false, _id: { $ne: new ObjectId(body.uniqueCategoryId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Name"), {}, {}));

        const response = await updateData(uniqueCategoryModel, { _id: new ObjectId(body.uniqueCategoryId), isDeleted: false }, body, {});
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.updateDataError('Unique Category'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Unique Category'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteUniqueCategory = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await deleteData(uniqueCategoryModel, { _id: new ObjectId(id), isDeleted: false });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Unique Category'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Unique Category'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getAllUniqueCategories = async (req, res) => {
    reqInfo(req);
    let { page, limit, search } = req.query, criteria: any = {}, options: any = { lean: true };
    try {
        criteria.isDeleted = false;

        if (search) {
            criteria.$or = [
                { name: { $regex: search, $options: 'si' } },
            ];
        }

        options.sort = { priority: 1, };

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(uniqueCategoryModel, criteria, {}, options);
        const totalCount = await countData(uniqueCategoryModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Unique Category'), {
            unique_category_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getUniqueCategoryById = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await getData(uniqueCategoryModel, { _id: ObjectId(id), isDeleted: false }, {}, {});
        if (!response || response.length === 0) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Unique Category'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Unique Category'), response[0], {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};