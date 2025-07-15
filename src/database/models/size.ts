var mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
    name: { type: String },
    priority: { type: Number, default: 1 },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const sizeModel = mongoose.model('size', sizeSchema);