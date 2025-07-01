var mongoose = require('mongoose');

const ProductReviewSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const productReviewModel = mongoose.model('product-review', ProductReviewSchema);