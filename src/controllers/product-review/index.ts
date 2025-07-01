import { productReviewModel } from '../../database';
import { apiResponse } from '../../common';
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
    try {
        const reviews = await productReviewModel.find();
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("Product Review"), reviews, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};