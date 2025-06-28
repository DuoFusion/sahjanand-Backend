const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
    name: { type: String },
    type: { type: String, enum: ['our', 'occasion', 'material', 'color', 'theme'] },
    description: { type: String },
    image: { type: String }, // URL to banner image
    isVisible: { type: Boolean, default: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }],
    priority: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const collectionModel = mongoose.model('collection', collectionSchema);