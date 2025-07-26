var mongoose = require('mongoose')

const shipRocketOrderSchema = new mongoose.Schema({
    // Internal order reference
    internalOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'order', required: true },
    
    // Shiprocket order details
    shiprocketOrderId: { type: String, unique: true },
    channelId: { type: String },
    pickupLocation: { type: String, default: 'Primary' },
    
    // Order information
    orderId: { type: String, required: true },
    orderDate: { type: Date, default: Date.now },
    pickupDate: { type: Date },
    deliveryDate: { type: Date },
    
    // Customer details
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    
    // Shipping address
    shippingAddress: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        address2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        postalCode: { type: String, required: true },
        email: { type: String }
    },
    
    // Order items
    items: [{
        name: { type: String, required: true },
        sku: { type: String },
        units: { type: Number, required: true },
        sellingPrice: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        hsn: { type: Number }
    }],
    
    // Payment details
    paymentMethod: { type: String, default: 'Prepaid' },
    subTotal: { type: Number, required: true },
    length: { type: Number },
    breadth: { type: Number },
    height: { type: Number },
    weight: { type: Number },
    
    // Shipping details
    courierId: { type: String },
    courierName: { type: String },
    awbNumber: { type: String },
    manifestUrl: { type: String },
    labelUrl: { type: String },
    invoiceUrl: { type: String },
    
    // Status tracking
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    },
    statusCode: { type: String },
    statusMessage: { type: String },
    
    // Tracking details
    trackingData: {
        shipmentStatus: { type: String },
        shipmentStatusId: { type: Number },
        shipmentTrack: [{
            id: { type: Number },
            status: { type: String },
            statusLocation: { type: String },
            statusDate: { type: Date },
            statusTime: { type: String },
            statusBody: { type: String }
        }]
    },
    
    // Webhook data
    webhookData: [{
        event: { type: String },
        data: { type: mongoose.Schema.Types.Mixed },
        timestamp: { type: Date, default: Date.now }
    }],
    
    // Error handling
    errorMessage: { type: String },
    retryCount: { type: Number, default: 0 },
    
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

// Indexes for better query performance
shipRocketOrderSchema.index({ shiprocketOrderId: 1 });
shipRocketOrderSchema.index({ internalOrderId: 1 });
shipRocketOrderSchema.index({ awbNumber: 1 });
shipRocketOrderSchema.index({ status: 1 });

export const shipRocketOrderModel = mongoose.model('ship_rocket_order', shipRocketOrderSchema); 