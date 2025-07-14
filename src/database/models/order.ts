var mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
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
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const orderModel = mongoose.model('order', orderSchema);