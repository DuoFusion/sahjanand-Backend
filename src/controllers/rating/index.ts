import { apiResponse } from '../../common';
import { ratingModel } from '../../database';
import { createData, getData, reqInfo, responseMessage, updateData, countData, findAllWithPopulate, aggregateData } from '../../helper';

let ObjectId = require("mongoose").Types.ObjectId;

export const createRating = async (req, res) => {
    reqInfo(req);
    let body = req.body, { user } = req.headers;
    try {
        body.userId = user?._id;
        const response = await createData(ratingModel, body)
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Rating'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateRating = async (req, res) => {
    reqInfo(req);
    const body = req.body;
    try {
        const response = await updateData(ratingModel, { _id: new ObjectId(body.ratingId) }, body, {});
        if (!response) return res.status(400).json(new apiResponse(400, responseMessage.updateDataError('Rating'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Rating'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteRating = async (req, res) => {
    reqInfo(req);
    const { id } = req.params;
    try {
        const response = await updateData(ratingModel, { _id: new ObjectId(id) }, { isDeleted: true }, {});
        if (!response) return res.status(400).json(new apiResponse(400, responseMessage.getDataNotFound('Rating'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Rating'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getRatings = async (req, res) => {
    reqInfo(req);
    let { page, limit, productId } = req.query, options: any = { lean: true }, criteria: any = { isDeleted: false }, { user } = req.headers;
    try {
        if(productId) criteria.productId = new ObjectId(productId);
        
        options.sort = { createdAt: -1 };

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 0;

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(ratingModel, criteria, {}, options);
        const totalCount = await countData(ratingModel, criteria);

        const stateObj = {
            page: pageNum,
            limit: limitNum,
            page_limit: Math.ceil(totalCount / limitNum) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Ratings'), { rating_data: response, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getRatingByProductId = async (req, res) => {
    reqInfo(req);
    const { productId } = req.params;
    try {
        const response = await findAllWithPopulate(ratingModel, { productId: new ObjectId(productId), isDeleted: false }, {}, {}, [
            { path: 'productId', select: 'name description price images' },
            { path: 'userId', select: 'firstName lastName email profilePic' }
        ]);

        // Calculate rating statistics
        const ratingStats = await calculateRatingStats(productId);
        
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Rating'), { 
            ratings: response, 
            ratingStats: ratingStats 
        }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

// Function to calculate rating statistics with formula
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

        const result = await aggregateData(ratingModel, pipeline);
        
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

// New endpoint to get only rating statistics for a product
export const getProductRatingStats = async (req, res) => {
    reqInfo(req);
    const { productId } = req.params;
    try {
        const ratingStats = await calculateRatingStats(productId);
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Rating Statistics'), ratingStats, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};