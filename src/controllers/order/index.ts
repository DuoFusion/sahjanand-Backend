import { apiResponse } from "../../common";
import { addressModel, orderModel } from "../../database";
import { responseMessage, getData, countData } from "../../helper";

const ObjectId = require('mongoose').Types.ObjectId;

export const placeOrder = async (req, res) => {
    let { user } = req.headers, body = req.body
    try {
        body.userId = user._id;

        let addressId = body.addressId;
        let shippingAddress = null;

        // Case 1: If addressId is provided, validate it exists and belongs to user
        if (addressId) {
            const existingAddress = await addressModel.findOne({ _id: new ObjectId(addressId), userId: new ObjectId(user._id), isDeleted: false });

            if (!existingAddress) return res.status(404).json(new apiResponse(404, "Address not found or doesn't belong to you", {}, {}));
            
            shippingAddress = existingAddress;
        }
        // Case 2: If a new address object is provided, create it
        else if (body.shippingAddress && typeof body.shippingAddress === 'object') {
            // Validate required address fields
            const requiredFields = ['name', 'phone', 'address', 'city', 'state', 'postalCode', 'country'];
            const missingFields = requiredFields.filter(field => !body.shippingAddress[field]);
            
            if (missingFields.length > 0) {
                return res.status(400).json(new apiResponse(400, `Missing required address fields: ${missingFields.join(', ')}`, {}, {}));
            }

            const newAddress = new addressModel({
                ...body.shippingAddress,
                userId: user._id
            });
            
            const savedAddress = await newAddress.save();
            addressId = savedAddress._id;
            shippingAddress = savedAddress;
        }
        // Case 3: If no address provided, try to find default address
        else {
            const defaultAddress = await addressModel.findOne({ userId: user._id, isDefault: true, isDeleted: false });

            if (!defaultAddress) return res.status(400).json(new apiResponse(400, "No address provided and no default address found. Please provide an address or set a default address.", {}, {}));
            
            addressId = defaultAddress._id;
            shippingAddress = defaultAddress;
        }

        body.shippingAddressId = new ObjectId(addressId);

        const order = new orderModel(body);
        await order.save();
        
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Order'), { 
            order,
            shippingAddress 
        }, {}));
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

export const getOrder = async (req, res) => {
    let { user } = req.headers, { page, limit } = req.query, criteria: any = { isDeleted: false };
    let options: any = { lean: true };

    try {
        // Add user filter to get only user's orders
        criteria.userId = new ObjectId(user._id);
        
        options.sort = { createdAt: -1 };

        // Add pagination if page and limit are provided
        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        // Get orders with product population
        const response = await orderModel.find(criteria, {}, options)
            .populate({
                path: 'products.productId',
                select: 'name price images description categoryId'
            })
            .populate({
                path: 'shippingAddressId',
                select: 'name phone address city state postalCode country'
            })
            .lean();

        const totalCount = await countData(orderModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Orders'), {
            order_data: response, 
            totalData: totalCount, 
            state: stateObj 
        }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};