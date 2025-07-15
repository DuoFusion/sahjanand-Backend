import { createData, getData, updateData, deleteData, reqInfo, responseMessage, countData } from "../../helper";
import { apiResponse } from "../../common";
import { ourStoryModel } from "../../database";

const ObjectId = require("mongoose").Types.ObjectId;

export const createOurStory = async (req, res) => {
    reqInfo(req)
    const body = req.body;
    try {
        const response = await createData(ourStoryModel, body);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.addDataError, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Our Story'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateOurStory = async (req, res) => {
    reqInfo(req)
    let body = req.body;
    try {
        const response = await updateData(ourStoryModel, { _id: new ObjectId(body.ourStoryId), isDeleted: false }, body, {});
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.updateDataError('Our Story'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Our Story'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteOurStory = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await deleteData(ourStoryModel, { _id: new ObjectId(id), isDeleted: false });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Our Story'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Our Story'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getAllOurStories = async (req, res) => {
    reqInfo(req);
    let { page, limit, search } = req.query, criteria: any = {}, options: any = { lean: true };
    try {
        criteria.isDeleted = false;

        if (search) {
            criteria.$or = [
                { title: { $regex: search, $options: 'si' } },
            ];
        }

        options.sort = { createdAt: -1, };

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(ourStoryModel, criteria, {}, options);
        const totalCount = await countData(ourStoryModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Our Story'), {
            our_story_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getOurStoryById = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await getData(ourStoryModel, { _id: ObjectId(id), isDeleted: false }, {}, {});
        if (!response || response.length === 0) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Our Story'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Our Story'), response[0], {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};