import { apiResponse } from '../../common';
import { inquiryModel } from '../../database';
import { responseMessage, reqInfo, createData, getData, updateData, countData, deleteData } from '../../helper';

const ObjectId = require("mongoose").Types.ObjectId;

export const createEnquiry = async (req, res) => {
    reqInfo(req)
    try {
        const body = req.body;
        const response = await createData(inquiryModel, body);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.addDataError, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Enquiry'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateEnquiry = async (req, res) => {
    reqInfo(req)
    let body = req.body;
    try {
        const response = await updateData(inquiryModel, { _id: new ObjectId(body.enquiryId) }, body, {});
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Enquiry'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Enquiry'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteEnquiry = async (req, res) => {
    reqInfo(req)
    let { id } = req.params;
    try {
        const response = await deleteData(inquiryModel, { _id: id });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Enquiry'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Enquiry'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getEnquiries = async (req, res) => {
    reqInfo(req)
    let { level, parent, page, limit, search } = req.query, criteria: any = { isDeleted: false };
    let options: any = { lean: true };

    try {
        if (level) criteria.level = level;
        if (parent) criteria.parent = parent;
        else criteria.parent = null;

        if (search) {
            criteria.name = { $regex: search, $options: 'si' };
        }

        options.sort = { createdAt: -1 };

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(inquiryModel, criteria, {}, options);
        const totalCount = await countData(inquiryModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Enquiries'), { enquiry_data: response, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};