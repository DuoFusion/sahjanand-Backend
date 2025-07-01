import { productReviewModel } from '../../database';
import { ADMIN_ROLES, apiResponse } from '../../common';
import { reqInfo, responseMessage } from '../../helper';

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
        let query = productReviewModel.find(criteria).sort({ createdAt: -1 });
        if (page && limit) {
            query = query.skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit));
        }
        const response = await query.lean();
        const totalCount = await productReviewModel.countDocuments(criteria);
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