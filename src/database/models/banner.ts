var mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    type: { type: String, enum: ['hero', 'offer', 'collection', 'section']},
    title: { type: String, required: true },
    imageDesktop: { type: String, required: true },
    imageMobile: { type: String, required: true },
    priority: { type: Number, default: 0 },
    linkType: { type: String, enum: ['product', 'collection', 'page', 'none'], default: 'none' },
    linkId: { type: mongoose.Schema.Types.ObjectId, refPath: 'linkType', },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });

export const bannerModel = mongoose.model('banner', bannerSchema);