import { productReviewModel } from '../../database';
import { ADMIN_ROLES, apiResponse } from '../../common';
import { reqInfo, responseMessage } from '../../helper';
import { aggregateData, countData } from '../../helper/database_service';

let ObjectId = require('mongoose').Types.ObjectId;

export const addProductReview = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers, body = req.body;
    try {
        body.userId = new ObjectId(user?._id)
        const review = await new productReviewModel(body).save();
        if (!review) return res.status(404).json(new apiResponse(404, responseMessage.addDataError, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Product Review'), review, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const editProductReview = async (req, res) => {
    reqInfo(req)
    let body = req.body;
    try {
        const review = await productReviewModel.findOneAndUpdate({ _id: new ObjectId(body.productReviewId) }, body, { new: true });
        if (!review) return res.status(404).json(new apiResponse(404, responseMessage.updateDataError("Product Review"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess("Product Review"), review, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteProductReview = async (req, res) => {
    reqInfo(req)
    let { id } = req.params;
    try {
        const review = await productReviewModel.findOneAndUpdate({ _id: new ObjectId(id) }, { isActive: false }, { new: true });
        if (!review) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("Product Review"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess("Product Review"), review, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const listProductReviews = async (req, res) => {
    reqInfo(req)
    let { page, limit, search } = req.query, { user } = req.headers;
    try {
        let criteria: any = { isDeleted: false };
        if (user?.roleId?.name === ADMIN_ROLES.USER) {
            criteria.userId = new ObjectId(user?._id)
        }
        if (search) {
            criteria.comment = { $regex: search, $options: 'si' };
        }

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
            {
                $lookup: {
                    from: "products",
                    let: { productId: "$productId" },
                    pipeline: [
                        {
                            $match: { $expr: { $and: [{ $eq: ['$_id', '$$productId'] },], }, },
                        },
                        {
                            $project: { _id: 1, name: 1, images: 1, price: 1, salePrice: 1 }
                        }
                    ],
                    as: "product"
                }
            },
            {
                $unwind: { path: "$product", preserveNullAndEmptyArrays: true }
            },
            { $sort: { createdAt: -1 } }
        ];

        // Add pagination to pipeline if page and limit are provided
        if (page && limit) {
            pipeline.push(
                { $skip: (parseInt(page) - 1) * parseInt(limit) },
                { $limit: parseInt(limit) }
            );
        }

        const response = await aggregateData(productReviewModel, pipeline);
        const totalCount = await countData(productReviewModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Product Review'), { review_data: response, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
}

export const getUserProductReviews = async (req, res) => {
    reqInfo(req)
    let { page, limit, search, productFilter } = req.query, { user } = req.headers;
    try {
        let criteria: any = { isDeleted: false };

        if (productFilter) criteria.productId = new ObjectId(productFilter)

        if (search) {
            criteria.comment = { $regex: search, $options: 'si' };
        }

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
            {
                $lookup: {
                    from: "products",
                    let: { productId: "$productId" },
                    pipeline: [
                        {
                            $match: { $expr: { $and: [{ $eq: ['$_id', '$$productId'] },], }, },
                        },
                        {
                            $project: { _id: 1, name: 1, images: 1, price: 1, salePrice: 1 }
                        }
                    ],
                    as: "product"
                }
            },
            {
                $unwind: { path: "$product", preserveNullAndEmptyArrays: true }
            },
            { $sort: { createdAt: -1 } }
        ];

        // Add pagination to pipeline if page and limit are provided
        if (page && limit) {
            pipeline.push(
                { $skip: (parseInt(page) - 1) * parseInt(limit) },
                { $limit: parseInt(limit) }
            );
        }

        const response = await aggregateData(productReviewModel, pipeline);
        const totalCount = await countData(productReviewModel, criteria);

        let ratingStats = {};
        if (productFilter) {
            ratingStats = await calculateRatingStats(productFilter);
        }

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Product Review'), { review_data: response, ratingStats, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
}

export const calculateRatingStats = async (productId) => {
    try {
        const pipeline = [
            {
                $match: {
                    productId: new ObjectId(productId),
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: null,
                    totalRatings: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    totalStars: { $sum: '$rating' },
                    ratingDistribution: {
                        $push: '$rating'
                    }
                }
            },
            {
                $addFields: {
                    // Calculate weighted average (formula: sum of all ratings / total number of ratings)
                    weightedAverage: { $round: ['$averageRating', 1] },
                    // Calculate percentage for each star rating
                    star1Count: {
                        $size: {
                            $filter: {
                                input: '$ratingDistribution',
                                cond: { $eq: ['$$this', 1] }
                            }
                        }
                    },
                    star2Count: {
                        $size: {
                            $filter: {
                                input: '$ratingDistribution',
                                cond: { $eq: ['$$this', 2] }
                            }
                        }
                    },
                    star3Count: {
                        $size: {
                            $filter: {
                                input: '$ratingDistribution',
                                cond: { $eq: ['$$this', 3] }
                            }
                        }
                    },
                    star4Count: {
                        $size: {
                            $filter: {
                                input: '$ratingDistribution',
                                cond: { $eq: ['$$this', 4] }
                            }
                        }
                    },
                    star5Count: {
                        $size: {
                            $filter: {
                                input: '$ratingDistribution',
                                cond: { $eq: ['$$this', 5] }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    // Calculate percentages for each star rating
                    star1Percentage: {
                        $round: [
                            { $multiply: [{ $divide: ['$star1Count', '$totalRatings'] }, 100] },
                            1
                        ]
                    },
                    star2Percentage: {
                        $round: [
                            { $multiply: [{ $divide: ['$star2Count', '$totalRatings'] }, 100] },
                            1
                        ]
                    },
                    star3Percentage: {
                        $round: [
                            { $multiply: [{ $divide: ['$star3Count', '$totalRatings'] }, 100] },
                            1
                        ]
                    },
                    star4Percentage: {
                        $round: [
                            { $multiply: [{ $divide: ['$star4Count', '$totalRatings'] }, 100] },
                            1
                        ]
                    },
                    star5Percentage: {
                        $round: [
                            { $multiply: [{ $divide: ['$star5Count', '$totalRatings'] }, 100] },
                            1
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRatings: 1,
                    averageRating: { $round: ['$averageRating', 1] },
                    // weightedAverage: 1,
                    // totalStars: 1,
                    starDistribution: {
                        star1: { count: '$star1Count', percentage: '$star1Percentage' },
                        star2: { count: '$star2Count', percentage: '$star2Percentage' },
                        star3: { count: '$star3Count', percentage: '$star3Percentage' },
                        star4: { count: '$star4Count', percentage: '$star4Percentage' },
                        star5: { count: '$star5Count', percentage: '$star5Percentage' }
                    }
                }
            }
        ];

        const result = await aggregateData(productReviewModel, pipeline);
        
        if (result.length === 0) {
            return {
                totalRatings: 0,
                averageRating: 0,
                // weightedAverage: 0,
                // totalStars: 0,
                starDistribution: {
                    star1: { count: 0, percentage: 0 },
                    star2: { count: 0, percentage: 0 },
                    star3: { count: 0, percentage: 0 },
                    star4: { count: 0, percentage: 0 },
                    star5: { count: 0, percentage: 0 }
                }
            };
        }

        return result[0];
    } catch (error) {
        console.log('Error calculating rating stats:', error);
        throw error;
    }
};