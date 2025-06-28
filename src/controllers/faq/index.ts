import { reqInfo, responseMessage } from "../../helper";
import { faqModel } from "../../database/models";
import { addEditFaqSchema, updateFaqStatusSchema, getFaqByCategorySchema } from "../../validation";
import { apiResponse } from "../../common";
import { getData, countData } from "../../helper/database_service";

const ObjectId = require('mongoose').Types.ObjectId;

export const add_faq = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers

    try {
        const { error, value } = addEditFaqSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        let isExist = await faqModel.findOne({ priority: value.priority, isDeleted: false })
        if (isExist) return res.status(400).json(new apiResponse(400, responseMessage?.dataAlreadyExist("priority"), {}, {}))

        const response = await faqModel.create(value)
        if (!response) return res.status(400).json(new apiResponse(400, responseMessage?.addDataError, {}, {}))

        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("FAQ"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_faq = async (req, res) => {
    reqInfo(req)
    let { id } = req.params

    try {
        const { error, value } = addEditFaqSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        let isExist = await faqModel.findOne({ priority: value.priority, isDeleted: false, _id: { $ne: new ObjectId(value.faqId) } })
        if (isExist) return res.status(400).json(new apiResponse(400, responseMessage?.dataAlreadyExist("priority"), {}, {}))

        const response = await faqModel.findOneAndUpdate({ _id: new ObjectId(value.faqId), isDeleted: false }, value, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("FAQ"), {}, {}))

        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("FAQ"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_faq = async (req, res) => {
    reqInfo(req)
    let { id } = req.params

    try {
        const response = await faqModel.findOneAndUpdate({ _id: new ObjectId(id), isDeleted: false }, { isDeleted: true }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("FAQ"), {}, {}))

        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("FAQ"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
} 

export const get_all_faqs = async (req, res) => {
    reqInfo(req)
    let { page, limit, search, category, isActive } = req.query, criteria: any = { isDeleted: false };
    let options: any = { lean: true };

    try {
        // Filter by category
        if (category) {
            criteria.category = category;
        }

        // Search functionality
        if (search) {
            criteria.$or = [
                { question: { $regex: search, $options: 'si' } },
                { answer: { $regex: search, $options: 'si' } }
            ];
        }

        options.sort = { priority: 1 };

        // Pagination
        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(faqModel, criteria, {}, options);
        const totalCount = await countData(faqModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('FAQs'), {
            faq_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
}

export const get_faq_by_category = async (req, res) => {
    reqInfo(req)
    let { category } = req.params

    try {
        const { error, value } = getFaqByCategorySchema.validate({ category })
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const response = await faqModel.find({
            category: value.category,
            isDeleted: false,
            isActive: true
        }).sort({ createdAt: -1 })

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("FAQs by category"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_faq_by_id = async (req, res) => {
    reqInfo(req)
    let { id } = req.params

    try {
        const response = await faqModel.findOne({ _id: new ObjectId(id), isDeleted: false })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("FAQ"), {}, {}))

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("FAQ"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const update_faq_status = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    let { id } = req.params

    try {
        const { error, value } = updateFaqStatusSchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const response = await faqModel.findOneAndUpdate(
            { _id: new ObjectId(id), isDeleted: false },
            { isActive: value.isActive },
            { new: true }
        )
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("FAQ"), {}, {}))

        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("FAQ status"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

