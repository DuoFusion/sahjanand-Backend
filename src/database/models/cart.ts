var mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, unique: true },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
            quantity: { type: Number },
            color: { type: String },
            size: { type: String },
            price: { type: Number },
        }
    ],
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export const cartModel = mongoose.model('cart', cartSchema); 