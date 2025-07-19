var mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
        quantity: { type: Number },
        price: { type: Number },
        size: { type: String },
        color: { type: String }
    }],
    totalAmount: { type: Number },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    orderStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    freeShippingApplied: { type: Boolean, default: false },
    freeShippingThreshold: { type: Number, default: false },
    shippingCharge: { type: Number, default: 0 },
    shippingAddress: {
        address: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String },
        phoneNumber: { type: String },
        email: { type: String },
    },
    trackingId: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const orderModel = mongoose.model('order', orderSchema);