import { apiResponse } from "../../common";
import { addressModel, orderModel } from "../../database";
import { responseMessage } from "../../helper";

const ObjectId = require('mongoose').Types.ObjectId;

export const placeOrder = async (req, res) => {
    let { user } = req.headers, body = req.body
    try {
        body.userId = user._id;

        let addressId = body.addressId;

        // If a new address object is provided (not just an ID)
        if (!addressId && body.shippingAddress && typeof body.shippingAddress === 'object') {
            const newAddress = new addressModel({
                ...body.shippingAddress,
                userId: user._id
            });
            const savedAddress = await newAddress.save();
            addressId = savedAddress._id;
        }

        if (!addressId) {
            const defaultAddress = await addressModel.findOne({ userId: user._id, isDefault: true });
            if (!defaultAddress) return res.status(404).json(new apiResponse(404, "No address provided and no default address found.", {}, {}));
            
            addressId = defaultAddress._id;
        }

        body.shippingAddressId = new ObjectId(addressId);

        const order = new orderModel(body);
        await order.save();
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Order'), { order }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const trackOrder = async (req, res) => {
    try {
        const { trackingId } = req.params;
        const order = await orderModel.findOne({ trackingId });

        if (!order) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Order'), {}, {}));

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Order'), { orderStatus: order.orderStatus, trackingId: order.trackingId }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus, trackingId } = req.body;

        const order = await orderModel.findOneAndUpdate({ _id: new ObjectId(orderId) }, { orderStatus, trackingId }, { new: true });

        if (!order) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Order'), {}, {}));

        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Order'), { order }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};
