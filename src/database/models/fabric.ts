var mongoose = require('mongoose');

const fabricSchema = new mongoose.Schema({
    name: { type: String },
    priority: { type: Number, default: 1 },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const fabricModel = mongoose.model('fabric', fabricSchema);