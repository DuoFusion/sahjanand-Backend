var mongoose = require('mongoose')

const cmsSchema = new mongoose.Schema({
    type: { type: String, enum: ['page', 'section', 'offer', 'social', 'whatsapp'] },
    title: { type: String },
    slug: { type: String },
    content: { type: mongoose.Schema.Types.ObjectId },
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true, versionKey: false });

export const cmsModel = mongoose.model('cms', cmsSchema); 