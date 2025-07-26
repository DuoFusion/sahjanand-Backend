import { apiResponse } from "../../common";
import { shipRocketOrderModel, orderModel } from "../../database";
import { responseMessage, reqInfo, findOneAndPopulate, findAllWithPopulateWithSorting, countData } from "../../helper";
import { shipRocketService } from "../../helper/ship-rocket-service";

const ObjectId = require('mongoose').Types.ObjectId;

export const createShipRocketOrder = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers, body = req.body;
    
    try {
        // Validate that internal order ID is provided
        if (!body.internalOrderId) {
            return res.status(400).json(new apiResponse(400, 'Internal order ID is required', {}, {}));
        }

        // Check if internal order exists and belongs to user (if user is not admin)
        const internalOrder = await orderModel.findOne({ 
            _id: new ObjectId(body.internalOrderId), 
            isDeleted: false 
        });

        if (!internalOrder) {
            return res.status(404).json(new apiResponse(404, 'Internal order not found', {}, {}));
        }

        // Check if user has permission to access this order
        if (user?.roleId?.name !== 'admin' && internalOrder.userId.toString() !== user._id.toString()) {
            return res.status(403).json(new apiResponse(403, 'Access denied to this order', {}, {}));
        }

        // Check if Shiprocket order already exists for this internal order
        const existingShiprocketOrder = await shipRocketOrderModel.findOne({
            internalOrderId: new ObjectId(body.internalOrderId),
            isDeleted: false
        });

        if (existingShiprocketOrder) {
            return res.status(400).json(new apiResponse(400, 'Shiprocket order already exists for this internal order', {
                shiprocketOrder: existingShiprocketOrder
            }, {}));
        }

        // Convert internal order to Shiprocket format
        const shiprocketPayload = await shipRocketService.convertInternalOrderToShiprocket(body.internalOrderId);
        
        if (!shiprocketPayload) {
            return res.status(500).json(new apiResponse(500, 'Failed to convert internal order to Shiprocket format', {}, {}));
        }

        // Validate the Shiprocket payload
        const validation = shipRocketService.validateOrderPayload(shiprocketPayload);
        if (!validation.isValid) {
            return res.status(400).json(new apiResponse(400, 'Validation failed', {}, validation.errors));
        }

        // Create order on Shiprocket
        const shiprocketResponse = await shipRocketService.createOrder(shiprocketPayload);
        
        if (shiprocketResponse.status !== 200) {
            return res.status(shiprocketResponse.status).json(new apiResponse(
                shiprocketResponse.status, 
                shiprocketResponse.message, 
                {}, 
                shiprocketResponse.error
            ));
        }

        // Save Shiprocket order details to database
        const shiprocketOrderData = {
            internalOrderId: new ObjectId(body.internalOrderId),
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

        const shiprocketOrder = new shipRocketOrderModel(shiprocketOrderData);
        await shiprocketOrder.save();

        // Update internal order with Shiprocket reference
        await orderModel.findOneAndUpdate(
            { _id: new ObjectId(body.internalOrderId) },
            { 
                shiprocketOrderId: shiprocketResponse.data.shipment_id,
                orderStatus: 'processing' // Update status to indicate Shiprocket integration
            }
        );

        return res.status(200).json(new apiResponse(200, 'Shiprocket order created successfully', {
            shiprocketOrder,
            internalOrder: internalOrder,
            shiprocketResponse: shiprocketResponse.data
        }, {}));

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

/**
 * Generate AWB number for an order
 */
export const generateAWB = async (req, res) => {
    reqInfo(req);
    const { id } = req.params;
    const { courierId } = req.body;

    try {
        if (!courierId) {
            return res.status(400).json(new apiResponse(400, 'Courier ID is required', {}, {}));
        }

        // Find the Shiprocket order
        const shiprocketOrder = await shipRocketOrderModel.findOne({ 
            _id: new ObjectId(id), 
            isDeleted: false 
        });

        if (!shiprocketOrder) {
            return res.status(404).json(new apiResponse(404, 'Shiprocket order not found', {}, {}));
        }

        // Generate AWB on Shiprocket
        const awbResponse = await shipRocketService.generateAWB(shiprocketOrder.shiprocketOrderId, courierId);
        
        if (awbResponse.status !== 200) {
            return res.status(awbResponse.status).json(new apiResponse(
                awbResponse.status, 
                awbResponse.message, 
                {}, 
                awbResponse.error
            ));
        }

        // Update order with AWB details
        const updatedOrder = await shipRocketOrderModel.findOneAndUpdate(
            { _id: new ObjectId(id) },
            {
                awbNumber: awbResponse.data.awb_code,
                courierId: courierId,
                courierName: awbResponse.data.courier_name,
                status: 'confirmed',
                manifestUrl: awbResponse.data.manifest_url,
                labelUrl: awbResponse.data.label_url,
                invoiceUrl: awbResponse.data.invoice_url
            },
            { new: true }
        );

        // Update internal order with AWB number
        await orderModel.findOneAndUpdate(
            { _id: shiprocketOrder.internalOrderId },
            { 
                trackingId: awbResponse.data.awb_code,
                orderStatus: 'shipped'
            }
        );

        return res.status(200).json(new apiResponse(200, 'AWB generated successfully', {
            order: updatedOrder,
            awbResponse: awbResponse.data
        }, {}));

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

/**
 * Request pickup for an order
 */
export const requestPickup = async (req, res) => {
    reqInfo(req);
    const { id } = req.params;

    try {
        // Find the Shiprocket order
        const shiprocketOrder = await shipRocketOrderModel.findOne({ 
            _id: new ObjectId(id), 
            isDeleted: false 
        });

        if (!shiprocketOrder) {
            return res.status(404).json(new apiResponse(404, 'Shiprocket order not found', {}, {}));
        }

        if (!shiprocketOrder.awbNumber) {
            return res.status(400).json(new apiResponse(400, 'AWB number is required before requesting pickup', {}, {}));
        }

        // Request pickup on Shiprocket
        const pickupResponse = await shipRocketService.requestPickup(shiprocketOrder.shiprocketOrderId);
        
        if (pickupResponse.status !== 200) {
            return res.status(pickupResponse.status).json(new apiResponse(
                pickupResponse.status, 
                pickupResponse.message, 
                {}, 
                pickupResponse.error
            ));
        }

        // Update order status
        const updatedOrder = await shipRocketOrderModel.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { 
                status: 'processing',
                pickupDate: new Date()
            },
            { new: true }
        );

        return res.status(200).json(new apiResponse(200, 'Pickup requested successfully', {
            order: updatedOrder,
            pickupResponse: pickupResponse.data
        }, {}));

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

/**
 * Track shipment by AWB number
 */
export const trackShipmentByAWB = async (req, res) => {
    reqInfo(req);
    const { awbNumber } = req.params;

    try {
        if (!awbNumber) {
            return res.status(400).json(new apiResponse(400, 'AWB number is required', {}, {}));
        }

        // Track shipment on Shiprocket
        const trackingResponse = await shipRocketService.trackShipment(awbNumber);
        
        if (trackingResponse.status !== 200) {
            return res.status(trackingResponse.status).json(new apiResponse(
                trackingResponse.status, 
                trackingResponse.message, 
                {}, 
                trackingResponse.error
            ));
        }

        // Update local database with tracking data
        const shiprocketOrder = await shipRocketOrderModel.findOne({ awbNumber });
        if (shiprocketOrder) {
            await shipRocketOrderModel.findOneAndUpdate(
                { awbNumber },
                {
                    trackingData: {
                        shipmentStatus: trackingResponse.data.shipment_status,
                        shipmentStatusId: trackingResponse.data.shipment_status_id,
                        shipmentTrack: trackingResponse.data.shipment_track || []
                    }
                }
            );
        }

        return res.status(200).json(new apiResponse(200, 'Tracking data retrieved successfully', {
            trackingData: trackingResponse.data
        }, {}));

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

/**
 * Track shipment by order ID
 */
export const trackShipmentByOrderId = async (req, res) => {
    reqInfo(req);
    const { id } = req.params;

    try {
        // Find the Shiprocket order
        const shiprocketOrder = await shipRocketOrderModel.findOne({ 
            _id: new ObjectId(id), 
            isDeleted: false 
        });

        if (!shiprocketOrder) {
            return res.status(404).json(new apiResponse(404, 'Shiprocket order not found', {}, {}));
        }

        // Track shipment on Shiprocket
        const trackingResponse = await shipRocketService.trackShipmentByOrderId(shiprocketOrder.shiprocketOrderId);
        
        if (trackingResponse.status !== 200) {
            return res.status(trackingResponse.status).json(new apiResponse(
                trackingResponse.status, 
                trackingResponse.message, 
                {}, 
                trackingResponse.error
            ));
        }

        // Update local database with tracking data
        await shipRocketOrderModel.findOneAndUpdate(
            { _id: new ObjectId(id) },
            {
                trackingData: {
                    shipmentStatus: trackingResponse.data.shipment_status,
                    shipmentStatusId: trackingResponse.data.shipment_status_id,
                    shipmentTrack: trackingResponse.data.shipment_track || []
                }
            }
        );

        return res.status(200).json(new apiResponse(200, 'Tracking data retrieved successfully', {
            order: shiprocketOrder,
            trackingData: trackingResponse.data
        }, {}));

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

/**
 * Get available couriers for a pincode
 */
export const getCouriers = async (req, res) => {
    reqInfo(req);
    const { pincode, weight } = req.query;

    try {
        if (!pincode || !weight) {
            return res.status(400).json(new apiResponse(400, 'Pincode and weight are required', {}, {}));
        }

        const couriersResponse = await shipRocketService.getCouriers(pincode.toString(), parseFloat(weight.toString()));
        
        if (couriersResponse.status !== 200) {
            return res.status(couriersResponse.status).json(new apiResponse(
                couriersResponse.status, 
                couriersResponse.message, 
                {}, 
                couriersResponse.error
            ));
        }

        return res.status(200).json(new apiResponse(200, 'Couriers retrieved successfully', {
            couriers: couriersResponse.data
        }, {}));

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

/**
 * Cancel a Shiprocket order
 */
export const cancelShipRocketOrder = async (req, res) => {
    reqInfo(req);
    const { id } = req.params;

    try {
        // Find the Shiprocket order
        const shiprocketOrder = await shipRocketOrderModel.findOne({ 
            _id: new ObjectId(id), 
            isDeleted: false 
        });

        if (!shiprocketOrder) {
            return res.status(404).json(new apiResponse(404, 'Shiprocket order not found', {}, {}));
        }

        // Cancel order on Shiprocket
        const cancelResponse = await shipRocketService.cancelOrder(shiprocketOrder.shiprocketOrderId);
        
        if (cancelResponse.status !== 200) {
            return res.status(cancelResponse.status).json(new apiResponse(
                cancelResponse.status, 
                cancelResponse.message, 
                {}, 
                cancelResponse.error
            ));
        }

        // Update order status
        const updatedOrder = await shipRocketOrderModel.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { status: 'cancelled' },
            { new: true }
        );

        // Update internal order status
        await orderModel.findOneAndUpdate(
            { _id: shiprocketOrder.internalOrderId },
            { orderStatus: 'cancelled' }
        );

        return res.status(200).json(new apiResponse(200, 'Order cancelled successfully', {
            order: updatedOrder
        }, {}));

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

/**
 * Get all Shiprocket orders
 */
export const getAllShipRocketOrders = async (req, res) => {
    reqInfo(req);
    let { page, limit, status } = req.query, criteria: any = { isDeleted: false };
    let options: any = { lean: true };

    try {
        if (status) {
            criteria.status = status;
        }

        options.sort = { createdAt: -1 };

        // Add pagination if page and limit are provided
        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const populateModel = [
            {
                path: 'internalOrderId',
                select: 'orderId totalAmount orderStatus'
            }
        ];

        const response = await findAllWithPopulateWithSorting(shipRocketOrderModel, criteria, {}, options, populateModel);
        const totalCount = await countData(shipRocketOrderModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, 'Shiprocket orders retrieved successfully', {
            orders: response,
            totalData: totalCount,
            state: stateObj
        }, {}));

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

/**
 * Get Shiprocket order by ID
 */
export const getShipRocketOrderById = async (req, res) => {
    reqInfo(req);
    const { id } = req.params;

    try {
        const response = await findOneAndPopulate(shipRocketOrderModel, { _id: new ObjectId(id), isDeleted: false }, {}, {}, [
            {
                path: 'internalOrderId',
                select: 'orderId totalAmount orderStatus products'
            }
        ]);

        if (!response) {
            return res.status(404).json(new apiResponse(404, 'Shiprocket order not found', {}, {}));
        }

        return res.status(200).json(new apiResponse(200, 'Shiprocket order retrieved successfully', response, {}));

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

/**
 * Webhook endpoint to receive updates from Shiprocket
 */
export const shipRocketWebhook = async (req, res) => {
    reqInfo(req);
    const webhookData = req.body;

    try {
        console.log('Shiprocket webhook received:', webhookData);

        // Extract order information from webhook
        const { shipment_id, awb_code, status, status_code, status_message } = webhookData;

        if (!shipment_id) {
            return res.status(400).json(new apiResponse(400, 'Shipment ID is required in webhook', {}, {}));
        }

        // Find the order by Shiprocket order ID
        const shiprocketOrder = await shipRocketOrderModel.findOne({ 
            shiprocketOrderId: shipment_id,
            isDeleted: false 
        });

        if (!shiprocketOrder) {
            console.log(`Order not found for shipment_id: ${shipment_id}`);
            return res.status(404).json(new apiResponse(404, 'Order not found', {}, {}));
        }

        // Update order with webhook data
        const updateData: any = {
            status: status || shiprocketOrder.status,
            statusCode: status_code,
            statusMessage: status_message
        };

        // Update AWB if provided
        if (awb_code) {
            updateData.awbNumber = awb_code;
        }

        // Add webhook data to history
        updateData.webhookData = shiprocketOrder.webhookData || [];
        updateData.webhookData.push({
            event: webhookData.event || 'status_update',
            data: webhookData,
            timestamp: new Date()
        });

        // Update delivery date if status is delivered
        if (status === 'delivered') {
            updateData.deliveryDate = new Date();
        }

        const updatedOrder = await shipRocketOrderModel.findOneAndUpdate(
            { _id: shiprocketOrder._id },
            updateData,
            { new: true }
        );

        // Update internal order status if exists
        if (shiprocketOrder.internalOrderId) {
            let internalOrderStatus = 'processing';
            
            switch (status) {
                case 'confirmed':
                    internalOrderStatus = 'processing';
                    break;
                case 'shipped':
                    internalOrderStatus = 'shipped';
                    break;
                case 'delivered':
                    internalOrderStatus = 'delivered';
                    break;
                case 'cancelled':
                    internalOrderStatus = 'cancelled';
                    break;
                case 'returned':
                    internalOrderStatus = 'returned';
                    break;
            }

            await orderModel.findOneAndUpdate(
                { _id: shiprocketOrder.internalOrderId },
                { 
                    orderStatus: internalOrderStatus,
                    trackingId: awb_code || shiprocketOrder.awbNumber
                }
            );
        }

        console.log(`Order ${shipment_id} updated with status: ${status}`);

        return res.status(200).json(new apiResponse(200, 'Webhook processed successfully', {
            orderId: updatedOrder._id,
            status: status
        }, {}));

    } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).json(new apiResponse(500, 'Error processing webhook', {}, error));
    }
}; 