import { apiResponse } from '../../common';
import { askAQuestionModel } from '../../database';
import { createData, getData, reqInfo, responseMessage, updateData, countData } from '../../helper';

let ObjectId = require("mongoose").Types.ObjectId;

export const createAskAQuestion = async (req, res) => {
    reqInfo(req);
    let body = req.body;
    try {
        const response = await createData(askAQuestionModel, body)
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Ask A Question'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateAskAQuestion = async (req, res) => {
    reqInfo(req);
    const body = req.body;
    try {
        const response = await updateData(askAQuestionModel, { _id: new ObjectId(body.aksAQuestionId) }, body, {});
        if (!response) return res.status(400).json(new apiResponse(400, responseMessage.updateDataError('Ask A Question'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Ask A Question'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteAskAQuestion = async (req, res) => {
    reqInfo(req);
    const { id } = req.params;
    try {
        const response = await updateData(askAQuestionModel, { _id: new ObjectId(id) }, { isDeleted: true }, {});
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Ask A Question'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getAskAQuestions = async (req, res) => {
    reqInfo(req);
    try {
        let { search, page, limit } = req.query, options: any = { lean: true }, criteria: any = { isDeleted: false };

        if (search) {
            criteria.$or = [
                { name: { $regex: search, $options: 'si' } },
                { phoneNumber: { $regex: search, $options: 'si' } },
                { email: { $regex: search, $options: 'si' } },
            ];
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 0; // 0 means no limit in MongoDB

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(askAQuestionModel, criteria, {}, options);
        const totalCount = await countData(askAQuestionModel, criteria);

        const stateObj = {
            page: pageNum,
            limit: limitNum,
            page_limit: Math.ceil(totalCount / limitNum) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Ask A Questions'), { ask_a_question_data: response, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

