import { createData, getData, updateData, deleteData, reqInfo, responseMessage, countData } from "../../helper";
import { apiResponse } from "../../common";
import { materialModel } from "../../database";

const ObjectId = require("mongoose").Types.ObjectId;

export const createMaterial = async (req, res) => {
    reqInfo(req)
    const body = req.body;
    try {

        let isExist = await materialModel.findOne({ name: body.name, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Priority"), {}, {}));
        
        isExist = await materialModel.findOne({ priority: body.priority, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Name"), {}, {}));

        const response = await createData(materialModel, body);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.addDataError, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('material'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateMaterial = async (req, res) => {
    reqInfo(req)
    let body = req.body;
    try {

        let isExist = await materialModel.findOne({ name: body.name, isDeleted: false, _id: { $ne: new ObjectId(body.materialId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Priority"), {}, {}));
        
        isExist = await materialModel.findOne({ priority: body.priority, isDeleted: false, _id: { $ne: new ObjectId(body.materialId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Priority"), {}, {}));

        const response = await updateData(materialModel, { _id: new ObjectId(body.materialId), isDeleted: false }, body, {});
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.updateDataError('material'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('material'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteMaterial = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await deleteData(materialModel, { _id: ObjectId(id), isDeleted: false });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('material'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('material'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getAllMaterials = async (req, res) => {
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

        const response = await getData(materialModel, criteria, {}, options);
        const totalCount = await countData(materialModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('material'), {
            material_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getMaterialById = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await getData(materialModel, { _id: ObjectId(id), isDeleted: false }, {}, {});
        if (!response || response.length === 0) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('material'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('material'), response[0], {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};