import { apiResponse } from "../../common";
import { shipRocketOrderModel, orderModel } from "../../database";
import { responseMessage, reqInfo, findOneAndPopulate, findAllWithPopulateWithSorting, countData } from "../../helper";
import { shipRocketService } from "../../helper/ship-rocket-service";

const ObjectId = require('mongoose').Types.ObjectId;

// Derive internal order status from Shiprocket signals
const deriveInternalOrderStatus = (rawStatus: any, activities: string[] = []) => {
    const normalize = (s: any) => String(s || '')
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/-/g, '_');
    const status = normalize(rawStatus);

    // Direct mappings
    switch (status) {
        case 'new':
        case 'processing':
            return 'processing';
        case 'confirmed':
            return 'confirmed';
        case 'invoiced':
            return 'processing';
        case 'manifested':
            return 'manifested';
        case 'out_for_pickup':
            return 'out_for_pickup';
        case 'picked_up':
            return 'picked_up';
        case 'order_shipped':
        case 'shipped':
            return 'shipped';
        case 'in_transit':
            return 'in_transit';
        case 'out_for_delivery':
            return 'out_for_delivery';
        case 'delivered':
            return 'delivered';
        case 'cancelled':
            return 'cancelled';
        case 'return_to_origin':
        case 'rto':
        case 'returned':
            return 'returned';
        default:
            break;
    }

    // Fallback based on activities when status text is vague or missing
    const upperActivities = (activities || []).map(a => String(a || '').toUpperCase());
    if (upperActivities.includes('DELIVERED')) return 'delivered';
    if (upperActivities.includes('OUT_FOR_DELIVERY')) return 'out_for_delivery';
    if (upperActivities.includes('ORDER_IN_TRANSIT')) return 'in_transit';
    if (upperActivities.includes('PICKED_UP')) return 'picked_up';
    if (upperActivities.includes('OUT_FOR_PICKUP')) return 'out_for_pickup';
    if (upperActivities.includes('ORDER_SHIPPED')) return 'shipped';
    if (upperActivities.includes('RETURNED')) return 'returned';
    if (upperActivities.includes('FAILED_DELIVERY')) return 'in_transit';

    return 'processing';
};

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
    // const { id } = req.params;
    const { courierId, shipmentId } = req.body;

    try {
        if (!courierId) return res.status(400).json(new apiResponse(400, 'Courier ID is required', {}, {}));

        // Find the Shiprocket order
        const shiprocketOrder = await shipRocketOrderModel.findOne({
            _id: new ObjectId(shipmentId),
            isDeleted: false
        });

        if (!shiprocketOrder) return res.status(404).json(new apiResponse(404, 'Shiprocket order not found', {}, {}));

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
            { _id: new ObjectId(shipmentId) },
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
        await orderModel.findOneAndUpdate({ _id: shiprocketOrder.internalOrderId }, { trackingId: awbResponse.data.awb_code, orderStatus: 'shipped' });

        return res.status(200).json(new apiResponse(200, 'AWB generated successfully', { order: updatedOrder, awbResponse: awbResponse.data }, {}));

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

export const getOrderDetailsByShiprocketId = async (req, res) => {
    reqInfo(req);
    const { shiprocketOrderId } = req.params;
    try {
        // First find the Shiprocket order in our database using internal order ID
        const shiprocketOrder = await shipRocketOrderModel.findOne({ internalOrderId: new ObjectId(shiprocketOrderId), isDeleted: false });
        if (!shiprocketOrder) return res.status(404).json(new apiResponse(404, 'Shiprocket order not found', {}, {}));

        // Get order details directly from Shiprocket using the Shiprocket order ID
        const orderResponse = await shipRocketService.trackShipmentByOrderId(shiprocketOrder.shiprocketOrderId);

        if (orderResponse.status !== 200) {
            return res.status(orderResponse.status).json(new apiResponse(
                orderResponse.status,
                orderResponse.message,
                {},
                orderResponse.error
            ));
        }
        const orders = orderResponse?.data?.data || orderResponse?.data?.data || [];

        // Find the specific order by ID
        const orderData = orders.find((order: any) => order.id.toString() === shiprocketOrder.shiprocketOrderId.toString());

        if (!orderData) return res.status(404).json(new apiResponse(404, 'Order data not found', {}, {}));

        const activities = orderData.activities || [];

        const shipmentDetails = orderData.shipments?.[0] || {};
        const currentStatus = deriveInternalOrderStatus(orderData.status || shipmentDetails.status, activities);

        const linked = await shipRocketOrderModel.findOne({ shiprocketOrderId: String(orderData.id), isDeleted: false });
        if (linked?.internalOrderId) {
            const internalOrderStatus = deriveInternalOrderStatus(orderData.status, activities);
            await shipRocketOrderModel.findOneAndUpdate({ internalOrderId: new ObjectId(shiprocketOrderId), isDeleted: false }, { status: internalOrderStatus }, { new: true });
            await orderModel.findOneAndUpdate(
                { _id: linked.internalOrderId },
                { orderStatus: internalOrderStatus }
            );
        }

        return res.status(200).json(new apiResponse(200, 'Order details retrieved successfully', {
            currentStatus
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
    // reqInfo(req);
    const webhookData = req.body;

    try {
        console.log('Shiprocket webhook received:', webhookData);

        // Extract order information from webhook using actual field names
        const {
            order_id,
            sr_order_id,
            awb,
            current_status,
            current_status_id,
            shipment_status,
            shipment_status_id,
            current_timestamp,
            etd,
            scans,
            courier_name,
            is_return,
            channel_id
        } = webhookData;

        // Use sr_order_id as the primary identifier, fallback to order_id
        const shipmentId = sr_order_id || order_id;

        if (!shipmentId) {
            return res.status(400).json(new apiResponse(400, 'Order ID is required in webhook', {}, {}));
        }

        // Find the order by Shiprocket order ID
        console.log("shipmentId => ", shipmentId);
        const shiprocketOrder = await shipRocketOrderModel.findOne({
            shiprocketOrderId: shipmentId.toString(),
            isDeleted: false
        });

        if (!shiprocketOrder) {
            console.log(`Order not found for shipment_id: ${shipmentId}`);
            return res.status(404).json(new apiResponse(404, 'Order not found', {}, {}));
        }

        // Update order with webhook data
        const updateData: any = {
            status: current_status || shipment_status || shiprocketOrder.status,
            statusCode: current_status_id || shipment_status_id,
            statusMessage: `${current_status || shipment_status} - ${courier_name || 'Unknown Courier'}`,
            courierName: courier_name,
            isReturn: is_return === 1,
            channelId: channel_id,
            lastUpdated: new Date(current_timestamp || new Date())
        };

        // Update AWB if provided
        if (awb) {
            updateData.awbNumber = awb;
        }

        // Add webhook data to history
        updateData.webhookData = shiprocketOrder.webhookData || [];
        updateData.webhookData.push({
            event: 'status_update',
            data: webhookData,
            timestamp: new Date()
        });

        // Update delivery date if status is delivered
        if (current_status?.toLowerCase() === 'delivered' || shipment_status?.toLowerCase() === 'delivered') {
            updateData.deliveryDate = new Date();
        }

        // Add scan history if provided
        if (scans && Array.isArray(scans)) {
            updateData.scanHistory = shiprocketOrder.scanHistory || [];
            updateData.scanHistory.push(...scans.map(scan => ({
                ...scan,
                timestamp: new Date(scan.date)
            })));
        }

        const updatedOrder = await shipRocketOrderModel.findOneAndUpdate(
            { _id: shiprocketOrder._id },
            updateData,
            { new: true }
        );

        // Update internal order status if exists
        if (shiprocketOrder.internalOrderId) {
            let internalOrderStatus = 'processing';

            const statusLower = (current_status || shipment_status || '').toLowerCase();

            switch (statusLower) {
                case 'confirmed':
                case 'manifested':
                    internalOrderStatus = 'processing';
                    break;
                case 'shipped':
                case 'out_for_delivery':
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
                case 'out_for_pickup':
                    internalOrderStatus = 'processing';
                    break;
                default:
                    internalOrderStatus = 'processing';
                    break;
            }

            await orderModel.findOneAndUpdate(
                { _id: shiprocketOrder.internalOrderId },
                {
                    orderStatus: internalOrderStatus,
                    trackingId: awb || shiprocketOrder.awbNumber,
                    lastUpdated: new Date()
                }
            );
        }

        console.log(`Order ${shipmentId} updated with status: ${current_status || shipment_status}`);

        return res.status(200).json(new apiResponse(200, 'Webhook processed successfully', {
            orderId: updatedOrder._id,
            status: current_status || shipment_status,
            awb: awb,
            courierName: courier_name
        }, {}));

    } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).json(new apiResponse(500, 'Error processing webhook', {}, error));
    }
}; 