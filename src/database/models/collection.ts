const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ['our', 'occasion', 'material', 'color', 'theme'], required: true },
    description: { type: String },
    image: { type: String }, // URL to banner image
    isVisible: { type: Boolean, default: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }],
    priority: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const collectionModel = mongoose.model('collection', collectionSchema);