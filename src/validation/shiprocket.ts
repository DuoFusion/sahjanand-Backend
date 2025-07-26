import Joi from 'joi';

export const createShiprocketOrderSchema = Joi.object({
    internalOrderId: Joi.string().optional(),
    order_id: Joi.string().required(),
    order_date: Joi.string().required(),
    pickup_location: Joi.string().required(),
    billing_customer_name: Joi.string().required(),
    billing_last_name: Joi.string().optional(),
    billing_address: Joi.string().required(),
    billing_address_2: Joi.string().optional(),
    billing_city: Joi.string().required(),
    billing_pincode: Joi.string().required(),
    billing_state: Joi.string().required(),
    billing_country: Joi.string().required(),
    billing_email: Joi.string().email().required(),
    billing_phone: Joi.string().required(),
    billing_alternate_phone: Joi.string().optional(),
    shipping_is_billing: Joi.boolean().required(),
    shipping_customer_name: Joi.string().when('shipping_is_billing', {
        is: false,
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    shipping_last_name: Joi.string().optional(),
    shipping_address: Joi.string().when('shipping_is_billing', {
        is: false,
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    shipping_address_2: Joi.string().optional(),
    shipping_city: Joi.string().when('shipping_is_billing', {
        is: false,
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    shipping_pincode: Joi.string().when('shipping_is_billing', {
        is: false,
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    shipping_state: Joi.string().when('shipping_is_billing', {
        is: false,
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    shipping_country: Joi.string().when('shipping_is_billing', {
        is: false,
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    shipping_email: Joi.string().email().optional(),
    shipping_phone: Joi.string().when('shipping_is_billing', {
        is: false,
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    order_items: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
            sku: Joi.string().required(),
            units: Joi.number().integer().positive().required(),
            selling_price: Joi.number().positive().required(),
            discount: Joi.number().min(0).optional(),
            tax: Joi.number().min(0).optional(),
            hsn: Joi.number().integer().optional()
        })
    ).min(1).required(),
    payment_method: Joi.string().valid('Prepaid', 'COD').required(),
    sub_total: Joi.number().positive().required(),
    length: Joi.number().positive().optional(),
    breadth: Joi.number().positive().optional(),
    height: Joi.number().positive().optional(),
    weight: Joi.number().positive().optional()
});

export const generateAWBSchema = Joi.object({
    courierId: Joi.string().required()
});

export const getCouriersSchema = Joi.object({
    pincode: Joi.string().pattern(/^\d{6}$/).required(),
    weight: Joi.number().positive().required()
});

export const webhookSchema = Joi.object({
    shipment_id: Joi.string().required(),
    awb_code: Joi.string().optional(),
    status: Joi.string().optional(),
    status_code: Joi.string().optional(),
    status_message: Joi.string().optional(),
    event: Joi.string().optional(),
    // Add other webhook fields as needed
}).unknown(true); // Allow additional fields from Shiprocket 