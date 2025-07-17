var mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    type: { type: String, enum: ['hero', 'offer', 'collection', 'section'] },
    title: { type: String },
    description: { type: String },
    imageDesktop: { type: String },
    imageMobile: { type: String },
    percentage: { type: Number, default: 0 },
    priority: { type: Number, default: 0 },
    buttonVisible: { type: Boolean, default: false },
    buttonText: { type: String },
    linkType: { type: String, enum: ['isBestSeller', 'isNewArrival', 'isTrending', 'isFeatured', 'category', 'uniqueCategory', 'collection', 'page', 'none'], default: 'none' },
    linkId: { type: mongoose.Schema.Types.ObjectId, refPath: 'linkType', },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const bannerModel = mongoose.model('banner', bannerSchema);