import { createData, getData, updateData, deleteData, reqInfo, responseMessage, countData, updateMany } from "../../helper";
import { apiResponse } from "../../common";
import { fabricModel, productModel } from "../../database";

const ObjectId = require("mongoose").Types.ObjectId;

export const createFabric = async (req, res) => {
    reqInfo(req)
    const body = req.body;
    try {

        let isExist = await fabricModel.findOne({ name: body.name, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Name"), {}, {}));

        isExist = await fabricModel.findOne({ priority: body.priority, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Priority"), {}, {}));

        const response = await createData(fabricModel, body);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.addDataError, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Fabric'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateFabric = async (req, res) => {
    reqInfo(req)
    let body = req.body;
    try {

        let isExist = await fabricModel.findOne({ name: body.name, isDeleted: false, _id: { $ne: new ObjectId(body.fabricId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Name"), {}, {}));

        isExist = await fabricModel.findOne({ priority: body.priority, isDeleted: false, _id: { $ne: new ObjectId(body.fabricId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage.dataAlreadyExist("Priority"), {}, {}));

        const response = await updateData(fabricModel, { _id: new ObjectId(body.fabricId), isDeleted: false }, body, {});
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.updateDataError('Fabric'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Fabric'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteFabric = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await deleteData(fabricModel, { _id: new ObjectId(id), isDeleted: false });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Fabric'), {}, {}));
        
        await updateMany(productModel, { 'attributes.fabricIds': new ObjectId(id) }, { $pull: { 'attributes.fabricIds': new ObjectId(id) } }, {});

        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Fabric'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getAllFabrics = async (req, res) => {
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

        const response = await getData(fabricModel, criteria, {}, options);
        const totalCount = await countData(fabricModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Fabric'), {
            fabric_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getFabricById = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await getData(fabricModel, { _id: ObjectId(id), isDeleted: false }, {}, {});
        if (!response || response.length === 0) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Fabric'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Fabric'), response[0], {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};