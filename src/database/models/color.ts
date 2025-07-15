var mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
    name: { type: String },
    colorCode: { type: String },
    priority: { type: Number, default: 1 },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const colorModel = mongoose.model('color', colorSchema);