import { ADMIN_ROLES, apiResponse } from "../../common";
import { addressModel, cartModel, orderModel, roleModel, userModel } from "../../database";
import { responseMessage, countData, reqInfo, findAllWithPopulateWithSorting, getData, getFirstMatch, findOneAndPopulate } from "../../helper";
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { shipRocketService } from '../../helper/ship-rocket-service';
import { shipRocketOrderModel } from '../../database';


const ObjectId = require('mongoose').Types.ObjectId;

export const placeOrder = async (req, res) => {
    reqInfo(req);
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

        // Save the complete shipping address details in the order
        body.shippingAddress = {
            address: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.postalCode || shippingAddress.zipCode,
            country: shippingAddress.country,
            phoneNumber: shippingAddress.phone,
            email: shippingAddress.email || user.email
        };

        let order = new orderModel(body);
        await order.save();

        const razorpayOrder = await createRazorpayOrder({
            amount: order.totalAmount,
            currency: 'INR',
            receipt: order._id.toString()
        });
        if (!razorpayOrder) return res.status(500).json(new apiResponse(500, "Razorpay order creation failed", {}, {}));
        order = await orderModel.findOneAndUpdate({ _id: new ObjectId(order._id) }, { razorpayOrderId: razorpayOrder.id }, { new: true });
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Order'), {
            order,
            shippingAddress,
            razorpayOrder
        }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const createRazorpayOrder = async (payload) => {
    const { amount, currency = 'INR', receipt } = payload;
    try {
        const options = {
            amount: amount,
            currency,
            receipt,
        };

        let role = await roleModel.findOne({ name: ADMIN_ROLES.ADMIN, isDeleted: false })
        let user = await userModel.findOne({ roleId: new ObjectId(role?._id), isDeleted: false }).select('razorpayKeyId razorpayKeySecret').lean()
        const razorpay = new Razorpay({
            key_id: user.razorpayKeyId,
            key_secret: user.razorpayKeySecret,
        })
        
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const trackOrder = async (req, res) => {
    reqInfo(req)
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
    reqInfo(req)
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
    reqInfo(req)
    let { user } = req.headers, { page, limit, userFilter } = req.query, criteria: any = { isDeleted: false };
    let options: any = { lean: true };

    try {
        if (user?.roleId?.name === ADMIN_ROLES.USER) {
            criteria.userId = new ObjectId(user._id);
        }

        options.sort = { createdAt: -1 };

        // Add pagination if page and limit are provided
        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const populateModel = [
            {
                path: 'products.productId',
                select: 'name price images description categoryId'
            },
            {
                path: 'userId',
                select: 'firstName lastName email'
            }
        ];

        const response = await findAllWithPopulateWithSorting(orderModel, criteria, {}, options, populateModel);

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

export const verifyRazorpayPayment = async (req, res) => {
    reqInfo(req)
    let { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body, { user } = req.headers;
    try {
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest("hex");

        if (razorpay_signature !== expectedSignature) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("signature"), {}, {}));

        const order = await orderModel.findOne({ razorpayOrderId: razorpay_order_id }).lean();

        if (order) {
            await orderModel.findOneAndUpdate(
                { _id: new ObjectId(order._id) },
                { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, orderStatus: 'paid', totalAmount: order.totalAmount / 100 },
                { new: true, timestamps: false }
            );

            // 🚀 Shiprocket Integration: Automatically create Shiprocket order after payment
            // Check if Shiprocket order already exists
            const existingShiprocketOrder = await shipRocketOrderModel.findOne({
                internalOrderId: order._id,
                isDeleted: false
            });
            if (!existingShiprocketOrder) {
                // Convert internal order to Shiprocket format
                const shiprocketPayload = await shipRocketService.convertInternalOrderToShiprocket(order._id);
                if (shiprocketPayload) {
                    const validation = shipRocketService.validateOrderPayload(shiprocketPayload);
                    if (validation.isValid) {
                        const shiprocketResponse = await shipRocketService.createOrder(shiprocketPayload);
                        if (shiprocketResponse.status === 200) {
                            // Save Shiprocket order in DB
                            const shiprocketOrderData = {
                                internalOrderId: order._id,
                                shiprocketOrderId: shiprocketResponse.data.shipment_id,
                                orderId: shiprocketPayload.order_id,
                                orderDate: new Date(shiprocketPayload.order_date),
                                pickupLocation: shiprocketPayload.pickup_location,
                                customerName: shiprocketPayload.billing_customer_name,
                                customerEmail: shiprocketPayload.billing_email,
                                customerPhone: shiprocketPayload.billing_phone,
                                shippingAddress: {
                                    name: shiprocketPayload.billing_customer_name,
                                    phone: shiprocketPayload.billing_phone,
                                    address: shiprocketPayload.billing_address,
                                    address2: shiprocketPayload.billing_address_2,
                                    city: shiprocketPayload.billing_city,
                                    state: shiprocketPayload.billing_state,
                                    country: shiprocketPayload.billing_country,
                                    postalCode: shiprocketPayload.billing_pincode,
                                    email: shiprocketPayload.billing_email
                                },
                                items: shiprocketPayload.order_items.map(item => ({
                                    name: item.name,
                                    sku: item.sku,
                                    units: item.units,
                                    sellingPrice: item.selling_price,
                                    discount: item.discount || 0,
                                    tax: item.tax || 0,
                                    hsn: item.hsn
                                })),
                                paymentMethod: shiprocketPayload.payment_method,
                                subTotal: shiprocketPayload.sub_total,
                                length: shiprocketPayload.length,
                                breadth: shiprocketPayload.breadth,
                                height: shiprocketPayload.height,
                                weight: shiprocketPayload.weight,
                                status: 'pending'
                            };
                            await shipRocketOrderModel.create(shiprocketOrderData);

                            // Update internal order with Shiprocket reference
                            await orderModel.findOneAndUpdate(
                                { _id: order._id },
                                { shiprocketOrderId: shiprocketResponse.data.shipment_id, orderStatus: 'processing' }
                            );
                        }
                    }
                }
            }
        }

        await cartModel.deleteMany({ userId: new ObjectId(user._id) });

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("Order"), { order }, {}));

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}
export const getOrderById = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await findOneAndPopulate(orderModel, { _id: new ObjectId(id), isDeleted: false }, {}, {}, [
            {
                path: 'products.productId',
                select: 'name price images description categoryId'
            }
        ]);
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Order'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Order'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};