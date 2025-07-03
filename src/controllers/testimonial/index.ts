import { ADMIN_ROLES, apiResponse } from '../../common';
import { testimonialModel } from '../../database';
import { reqInfo, responseMessage } from '../../helper';

let ObjectId = require('mongoose').Types.ObjectId;

export const addTestimonial = async (req, res) => {
    reqInfo(req)
    let body = req.body, { user } = req.headers;
    try {
        body.userId = new ObjectId(user._id);
        const testimonial = await new testimonialModel(body).save();
        if (!testimonial) return res.status(404).json(new apiResponse(404, responseMessage.addDataError, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Testimonial'), testimonial, {}));
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

export const getTestimonials = async (req, res) => {
    reqInfo(req)
    let { page, limit, search } = req.query, criteria: any = { isDeleted: false }, { user } = req.headers;
    try {
        if (user.roleId.name !== ADMIN_ROLES.ADMIN) {
            criteria.userId = new ObjectId(user._id);
        }

        if (search) {
            criteria.$or = [
                { name: { $regex: search, $options: 'si' } },
                { message: { $regex: search, $options: 'si' } }
            ];
        }

        // Build aggregation pipeline
        const pipeline: any[] = [
            { $match: criteria },
            {
                $lookup: {
                    from: "users",
                    let: { userId: "$userId" },
                    pipeline: [
                        {
                            $match: { $expr: { $and: [{ $eq: ['$_id', '$$userId'] },], }, },
                        },
                        {
                            $project: { _id: 1, firstName: 1, lastName: 1, email: 1, profilePhoto: 1, userType: 1 }
                        }
                    ],
                    as: "user"
                }
            },
            {
                $unwind: { path: "$user", preserveNullAndEmptyArrays: true }
            },
            { $sort: { createdAt: -1 } }
        ];

        // Add pagination stages if page and limit are provided
        if (page && limit) {
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const limitValue = parseInt(limit);
            pipeline.push({ $skip: skip }); 
            pipeline.push({ $limit: limitValue });
        }

        const response = await testimonialModel.aggregate(pipeline);
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

export const getUserTestimonials = async (req, res) => {
    reqInfo(req)
    let criteria: any = { isDeleted: false };
    try {

        const pipeline = [
            { $match: criteria },
            {
                $lookup: {
                    from: "users",
                    let: { userId: "$userId" },
                    pipeline: [
                        {
                            $match: { $expr: { $and: [{ $eq: ['$_id', '$$userId'] },], }, },
                        },
                        {
                            $project: { _id: 1, firstName: 1, lastName: 1, email: 1, profilePhoto: 1, userType: 1 }
                        }
                    ],
                    as: "user"
                }
            },
            {
                $unwind: { path: "$user", preserveNullAndEmptyArrays: true }
            },
            { $sort: { createdAt: -1 } }
        ];

        const response = await testimonialModel.aggregate(pipeline);
        const totalCount = await testimonialModel.countDocuments(criteria);
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("Testimonial"), { testimonial_data: response, totalData: totalCount }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};