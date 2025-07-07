import { apiResponse } from '../../common';
import { newsLetterModel } from '../../database';
import { reqInfo, responseMessage } from '../../helper';

let ObjectId = require('mongoose').Types.ObjectId;

export const addNewsletter = async (req, res) => {
    reqInfo(req)
    let body = req.body
    try {
        const newsletter = await new newsLetterModel(body).save();
        if (!newsletter) return res.status(404).json(new apiResponse(404, responseMessage.addDataError, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Newsletter'), newsletter, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const editNewsletter = async (req, res) => {
    reqInfo(req)
    let body = req.body;
    try {
        const newsletter = await newsLetterModel.findOneAndUpdate({ _id: new ObjectId(body.newsLetterId) }, body, { new: true });
        if (!newsletter) return res.status(404).json(new apiResponse(404, responseMessage.updateDataError("Newsletter"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess("Newsletter"), newsletter, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteNewsletter = async (req, res) => {
    reqInfo(req)
    let { id } = req.params;
    try {
        const newsletter = await newsLetterModel.findOneAndUpdate({ _id: new ObjectId(id), isDeleted: false }, { isDeleted: true }, { new: true });
        if (!newsletter) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("Newsletter"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess("Newsletter"), newsletter, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getNewsletter = async (req, res) => {
    reqInfo(req)
    let { page, limit, search } = req.query, criteria: any = { isDeleted: false };
    try {

        if (search) {
            criteria.$or = [
                { email: { $regex: search, $options: 'si' } }
            ];
        }

        const pipeline: any[] = [
            { $match: criteria },
            { $sort: { createdAt: -1 } }
        ];

        // Add pagination stages if page and limit are provided
        if (page && limit) {
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const limitValue = parseInt(limit);
            pipeline.push({ $skip: skip });
            pipeline.push({ $limit: limitValue });
        }

        const response = await newsLetterModel.aggregate(pipeline);
        const totalCount = await newsLetterModel.countDocuments(criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("Newsletter"), { newsletter_data: response, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};