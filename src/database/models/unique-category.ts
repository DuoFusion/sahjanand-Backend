const mongoose = require('mongoose');

const uniqueCategorySchema = new mongoose.Schema({
    name: { type: String },
    priority: { type: Number },
    image: { type: String },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true, versionKey: false });

export const uniqueCategoryModel = mongoose.model('unique-category', uniqueCategorySchema)