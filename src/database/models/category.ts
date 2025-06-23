var mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    level: { type: Number, default: 1 },
    isFeatured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true, versionKey: false });

export const categoryModel = mongoose.model('category', categorySchema); 