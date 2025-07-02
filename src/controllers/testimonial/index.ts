import { apiResponse } from '../../common';
import { testimonialModel } from '../../database';
import { reqInfo, responseMessage } from '../../helper';

let ObjectId = require('mongoose').Types.ObjectId;

export const addTestimonial = async (req, res) => {
    reqInfo(req)
    let body = req.body;
    try {
        const testimonial = await new testimonialModel(body).save();
        if (!testimonial) return res.status(404).json(new apiResponse(404, responseMessage.addDataError, {}, {}));
        return res.status(201).json(new apiResponse(201, responseMessage.addDataSuccess('Testimonial'), testimonial, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const editTestimonial = async (req, res) => {
    reqInfo(req)
    let body = req.body;
    try {
        const testimonial = await testimonialModel.findOneAndUpdate({ _id: new ObjectId(body.testimonialId) }, body, { new: true });
        if (!testimonial) return res.status(404).json(new apiResponse(404, responseMessage.updateDataError("Testimonial"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess("Testimonial"), testimonial, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteTestimonial = async (req, res) => {
    reqInfo(req)
    let { id } = req.params;
    try {
        const testimonial = await testimonialModel.findOneAndUpdate({ _id: new ObjectId(id) }, { isActive: false }, { new: true });
        if (!testimonial) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("Testimonial"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess("Testimonial"), testimonial, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const listTestimonials = async (req, res) => {
    reqInfo(req)
    let { page, limit, search } = req.query;
    let criteria: any = { isDeleted: false };
    try {
        if (search) {
            criteria.$or = [
                { name: { $regex: search, $options: 'si' } },
                { message: { $regex: search, $options: 'si' } }
            ];
        }
        let query = testimonialModel.find(criteria).sort({ createdAt: -1 });
        if (page && limit) {
            query = query.skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit));
        }
        const response = await query.lean();
        const totalCount = await testimonialModel.countDocuments(criteria);
        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("Testimonial"), { testimonial_data: response, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
}; 