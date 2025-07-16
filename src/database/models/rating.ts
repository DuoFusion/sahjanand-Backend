var mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    name: { type: String },
    rating: { type: Number, enum: [1, 2, 3, 4, 5] },
    comment: { type: String },
    date: { type: Date },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const ratingModel = mongoose.model('rating', ratingSchema); 