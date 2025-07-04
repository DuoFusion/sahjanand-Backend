import { apiResponse } from '../../common';
import { enquiryModel } from '../../database';
import { responseMessage, reqInfo, createData, getData, updateData, countData, deleteData } from '../../helper';

const ObjectId = require("mongoose").Types.ObjectId;

export const createEnquiry = async (req, res) => {
    reqInfo(req)
    try {
        const body = req.body;
        const response = await createData(enquiryModel, body);
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
        const response = await updateData(enquiryModel, { _id: new ObjectId(body.enquiryId) }, body, {});
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
        const response = await deleteData(enquiryModel, { _id: id });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Enquiry'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Enquiry'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getEnquiries = async (req, res) => {
    reqInfo(req)
    let { page, limit, typeFilter } = req.query, criteria: any = { isDeleted: false };
    let options: any = { lean: true };

    try {

        options.sort = { createdAt: -1 };

        if (typeFilter) {
            criteria.type = typeFilter;
        }

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(enquiryModel, criteria, {}, options);
        const totalCount = await countData(enquiryModel, criteria);

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